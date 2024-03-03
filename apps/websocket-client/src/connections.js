const { connectWebSocket } = require("./websocket");

const HOST = "websocket.local";
const PATH = "ws/";
const NUMBER_OF_CONNECTIONS = 30;
const DELAY_BETWEEN_EACH_CONNECTION = 5000;

const connectionStatus = new Array(NUMBER_OF_CONNECTIONS).fill("pending");

function updateConnectionStatus(index, status) {
  connectionStatus[index] = status;
  console.log(`connection ${index + 1}: ${status}`);

  if (status === "alive" || status === "failed") {
    const nextIndex = index + 1;
    let delay = DELAY_BETWEEN_EACH_CONNECTION;

    if (nextIndex < NUMBER_OF_CONNECTIONS) {
      setTimeout(() => {
        updateConnectionStatus(nextIndex, "connecting");
        connectWebSocket(HOST, PATH, nextIndex, updateConnectionStatus, 0);
      }, delay);
    } else {
      console.log("All websocket connections have been processed!");
    }
  }
}

if (NUMBER_OF_CONNECTIONS > 0) {
  updateConnectionStatus(0, "connecting");
  connectWebSocket(HOST, PATH, 0, updateConnectionStatus, 0);
}

function closeAllConnections() {
  console.log("Closing all websocket connections.");
}

process.on("SIGINT", () => {
  closeAllConnections();
  process.exit();
});
