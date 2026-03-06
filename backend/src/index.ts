import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth"
import investorRoutes from "./routes/investors"
import { initDB } from "./database"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: ["https://fundflow-omega.vercel.app", "http://localhost:3000"],
  credentials: true
}))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/investors", investorRoutes)

app.get("/", (req, res) => {
  res.json({ message: "FundFlow API is running" })
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error("DB init failed:", err)
  process.exit(1)
})
