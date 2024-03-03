const { WebSocket } = require("ws");

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

function connectWebSocket(host, path, index, updateStatus, attempt) {
  const ws = new WebSocket(`ws://${host}/${path}`);

  ws.onopen = () => {
    updateStatus(index, "alive");
  };

  ws.onclose = () => {
    if (attempt < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        updateStatus(index, "retrying");
        connectWebSocket(host, path, index, updateStatus, attempt + 1);
      }, RECONNECT_DELAY);
    } else {
      updateStatus(index, "failed");
    }
  };

  ws.onerror = (error) => {
    console.log(`Conexão ${index + 1}: erro, ${error.message}`);
    ws.close();
  };
}

module.exports = {
  connectWebSocket,
};
