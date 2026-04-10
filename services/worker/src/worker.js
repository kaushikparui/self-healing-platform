import client from "prom-client"
import http from "http"

console.log("Worker started")

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics()

const crashCounter = new client.Counter({
  name: "worker_crashes_total",
  help: "Total number of worker crashes"
})

// Metrics server
const server = http.createServer(async (req, res) => {
  if (req.url === "/metrics") {
    res.setHeader("Content-Type", client.register.contentType)
    res.end(await client.register.metrics())
  }
})

server.listen(4000, () => {
  console.log("Metrics server running on 4000")
})

// Worker logic
setInterval(() => {
  console.log("Running background job...")

  if (Math.random() < 0.3) {
    console.log("💥 Simulating crash!")

    crashCounter.inc()

    // 👇 ADD DELAY BEFORE EXIT
    setTimeout(() => {
      process.exit(1)
    }, 3000)
  }
}, 8000)