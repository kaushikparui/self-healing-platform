const express = require("express");
const client = require("prom-client");

const app = express();
const port = 3000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get("/health", (req, res) => {
  res.send("ok");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(port, () => {
  console.log(`API running on ${port}`);
});

app.get("/status", async (req, res) => {
  res.json({
    system: "RUNNING",
    workers: [
      { name: "worker-1", status: "UP" },
      { name: "worker-2", status: "UP" }
    ]
  });
});

app.get("/crash", (req, res) => {
  process.exit(1); // simulate crash
});