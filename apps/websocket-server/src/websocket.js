const ws = require("ws");

let activeConnections = 0;

function initWebsocket(server, maxConnections, webSocketGauge) {
  const wss = new ws.Server({ noServer: true, path: "/ws/" });

  server.on("upgrade", function upgrade(request, socket, head) {
    if (activeConnections >= maxConnections) {
      socket.write(
        "HTTP/1.1 503 Service Unavailable\r\n" +
          "Content-Type: text/plain\r\n" +
          "Connection: close\r\n" +
          "\r\n" +
          "Limite máximo de conexões atingido"
      );
      
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", function (socket) {
    activeConnections++;
    webSocketGauge.set(activeConnections);

    console.log("Nova conexão estabelecida. Total de conexões:", activeConnections);

    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.on("close", function () {
      activeConnections--;
      webSocketGauge.set(activeConnections);

      console.log("Conexão encerrada. Total de conexões:", activeConnections);
    });

  });
  
  setInterval(() => {
    wss.clients.forEach((wsClient) => {
      if (!wsClient.isAlive) return wsClient.terminate();

      wsClient.isAlive = false;
      wsClient.ping();
    });
  }, 10000);
}

module.exports = { 
  activeConnections, 
  initWebsocket 
};
