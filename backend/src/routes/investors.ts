import { Router, Request, Response } from "express"
import pool from "../database"
import jwt from "jsonwebtoken"

const router = Router()

const getUser = (req: Request) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "secret") as any
  } catch {
    return null
  }
}

router.get("/", async (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })
  const result = await pool.query("SELECT * FROM investors WHERE user_id = $1", [user.id])
  return res.json(result.rows)
})

router.post("/", async (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })
  const { name, email, company, status, notes } = req.body
  if (!name || !email) return res.status(400).json({ error: "Name and email required" })
  const result = await pool.query(
    "INSERT INTO investors (user_id, name, email, company, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [user.id, name, email, company || "", status || "Outreach", notes || ""]
  )
  return res.status(201).json(result.rows[0])
})

router.patch("/:id", async (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })
  const { status } = req.body
  await pool.query("UPDATE investors SET status = $1 WHERE id = $2 AND user_id = $3", [status, req.params.id, user.id])
  return res.json({ success: true })
})

router.delete("/:id", async (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })
  await pool.query("DELETE FROM investors WHERE id = $1 AND user_id = $2", [req.params.id, user.id])
  return res.json({ success: true })
})

export default router