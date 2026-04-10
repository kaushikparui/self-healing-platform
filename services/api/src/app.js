import express from "express"
import client from "prom-client"

const app = express()

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics()

const counter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP Requests"
})

// Routes
app.get("/", (req, res) => {
  counter.inc()
  res.send("API is running 🚀")
})

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() })
})

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType)
  res.end(await client.register.metrics())
})

app.listen(3000, () => {
  console.log("API running on port 3000")
})