import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../database"

const router = Router()

router.post("/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)

  try {
    const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    const result = stmt.run(name, email, hashedPassword)
    
    const token = jwt.sign(
      { id: result.lastInsertRowid, email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    )

    return res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email } })
  } catch (err: any) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Email already exists" })
    }
    return res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign(
    { id: user.id, email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  )

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

export default router