const prometheusClient = require("prom-client");

const register = new prometheusClient.Registry();

const websocketGauge = new prometheusClient.Gauge({
  name: "websockets_connections_total",
  help: "The number of active WebSocket connections",
  registers: [register],
});

module.exports = {
  register,
  websocketGauge,
};
