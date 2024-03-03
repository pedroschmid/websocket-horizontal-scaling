const http = require("http");
const express = require("express");

const { register, websocketGauge } = require("./prometheus");
const { activeConnections, initWebsocket } = require("./websocket");

const MAX_CONNECTIONS = 10;

const app = express();
const server = http.createServer(app);

initWebsocket(server, MAX_CONNECTIONS, websocketGauge);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/metrics", async (req, res) => {
  res.end(await register.metrics());
});

app.get('/healthz', (req, res) => {
  if (activeConnections < MAX_CONNECTIONS) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('Service Unavailable');
  }
});


server.listen(3000, () => {
  console.log("Server running on port 3000");
});
