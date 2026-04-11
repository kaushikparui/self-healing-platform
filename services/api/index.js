const express = require("express");
const client = require("prom-client");

const app = express();
const port = 3000;

// ✅ IMPORTANT
app.use(express.json());

let workers = {};

// Prometheus metrics
client.collectDefaultMetrics();

// Health
app.get("/health", (req, res) => {
  res.send("ok");
});

// Metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Root
app.get("/", (req, res) => {
  res.send("API running");
});

// 🔥 Worker registration
app.post("/register", (req, res) => {
  const { name } = req.body;

  workers[name] = {
    status: "UP",
    lastSeen: Date.now()
  };

  console.log(`Worker registered: ${name}`);

  res.send("registered");
});

// 🔁 Heartbeat
app.post("/heartbeat", (req, res) => {
  const { name } = req.body;

  if (workers[name]) {
    workers[name].lastSeen = Date.now();
    workers[name].status = "UP";
  }

  res.send("ok");
});

// 📊 Status endpoint (REAL)
app.get("/status", (req, res) => {
  const result = Object.keys(workers).map(name => {
    const w = workers[name];

    const isAlive = Date.now() - w.lastSeen < 10000;

    return {
      name,
      status: isAlive ? "UP" : "DOWN"
    };
  });

  res.json({
    system: result.some(w => w.status === "DOWN") ? "DEGRADED" : "HEALTHY",
    workers: result
  });
});

// 💥 Crash API (for demo)
app.get("/crash", (req, res) => {
  res.send("Crashing API...");
  setTimeout(() => process.exit(1), 100);
});

// Start server
app.listen(port, () => {
  console.log(`API running on ${port}`);
});