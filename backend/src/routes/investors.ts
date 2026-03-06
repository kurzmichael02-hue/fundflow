import { Router, Request, Response } from "express"
import db from "../database"
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

router.get("/", (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })

  const investors = db.prepare("SELECT * FROM investors WHERE user_id = ?").all(user.id)
  return res.json(investors)
})

router.post("/", (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })

  const { name, email, company, status, notes } = req.body
  if (!name || !email) return res.status(400).json({ error: "Name and email required" })

  const stmt = db.prepare("INSERT INTO investors (user_id, name, email, company, status, notes) VALUES (?, ?, ?, ?, ?, ?)")
  const result = stmt.run(user.id, name, email, company || "", status || "Outreach", notes || "")

  return res.status(201).json({ id: result.lastInsertRowid, name, email, company, status, notes })
})

router.patch("/:id", (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })

  const { status } = req.body
  db.prepare("UPDATE investors SET status = ? WHERE id = ? AND user_id = ?").run(status, req.params.id, user.id)
  return res.json({ success: true })
})

router.delete("/:id", (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: "Unauthorized" })

  db.prepare("DELETE FROM investors WHERE id = ? AND user_id = ?").run(req.params.id, user.id)
  return res.json({ success: true })
})

export default router