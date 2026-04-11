const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const WORKER_NAME = process.env.WORKER_NAME || "unknown";
const API_URL = process.env.API_URL || "http://api:3000"; // ✅ FIXED (no localhost)

const express = require("express");
const client = require("prom-client");

const app = express();
const port = 4000;

// Prometheus metrics
client.collectDefaultMetrics();

const jobCounter = new client.Counter({
  name: "worker_jobs_total",
  help: "Total jobs processed",
  labelNames: ["worker"]
});

// 🔥 Simulated work
setInterval(() => {
  jobCounter.inc({ worker: WORKER_NAME });

  // 💥 random crash
  if (Math.random() < 0.1) {
    console.log(`[${WORKER_NAME}] Simulated crash!`);
    process.exit(1);
  }
}, 3000);

// Health endpoint
app.get("/health", (req, res) => {
  res.send("ok");
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Start server
app.listen(port, () => {
  console.log(`[${WORKER_NAME}] running on ${port}`);
});

// 🔥 Register with retry
async function register() {
  while (true) {
    try {
      await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: WORKER_NAME })
      });

      console.log(`[${WORKER_NAME}] registered`);
      break;
    } catch (err) {
      console.log(`[${WORKER_NAME}] register failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// 🔁 Heartbeat loop
async function startHeartbeat() {
  setInterval(async () => {
    try {
      await fetch(`${API_URL}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: WORKER_NAME })
      });

      console.log(`[${WORKER_NAME}] heartbeat sent`);
    } catch (err) {
      console.log(`[${WORKER_NAME}] heartbeat failed`);
    }
  }, 3000);
}

// 🚀 Boot sequence
(async () => {
  await register();
  startHeartbeat();
})();