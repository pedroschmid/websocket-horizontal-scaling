const { createClient } = require("redis");
const { uuidv4 } = require("./utils");

async function createRedisClient() {
  const client = createClient({
    url: "redis://default:redis@redis.redis.svc.cluster.local:6379",
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  return client;
}

const redisClient = (async () => {
  return await createRedisClient();
})();

async function setWebsocketConnection() {
  const sessionId = uuidv4();
  const podName = process.env.POD_NAME || "";

  const client = await redisClient;
  await client.set(
    `websocket:connections:${sessionId}`,
    JSON.stringify({
      session_id: sessionId,
      pod_id: podName,
    })
  );
}

module.exports = {
  redisClient,
  setWebsocketConnection,
};
