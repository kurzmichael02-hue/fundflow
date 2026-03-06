import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "../database"

const router = Router()

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" })

  const hashedPassword = bcrypt.hashSync(password, 10)
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })
    return res.status(201).json({ token, user: { id: user.id, name, email } })
  } catch (err: any) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already exists" })
    return res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: "All fields are required" })

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
  const user = result.rows[0]

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" })
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

export default router