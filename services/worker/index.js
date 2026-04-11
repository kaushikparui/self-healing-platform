const express = require("express");
const client = require("prom-client");

const app = express();
const port = 4000;

client.collectDefaultMetrics();

// custom metric
const jobCounter = new client.Counter({
  name: "worker_jobs_total",
  help: "Total jobs processed"
});

// simulate work + random crash
setInterval(() => {
  jobCounter.inc();

  // simulate crash randomly
  if (Math.random() < 0.1) {
    console.log("Simulated crash!");
    process.exit(1);
  }
}, 3000);

app.get("/health", (req, res) => {
  res.send("ok");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(port, () => {
  console.log(`Worker running on ${port}`);
});