import { createClient } from "redis";

export const connectRedis = async () => {
  const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 20) {
          console.error("Could not connect to Redis after multiple retries");
          return new Error('Could not connect to Redis');
        }
        console.log(`Redis reconnect attempt #${retries}`);
        return Math.min(retries * 100, 3000); // backoff
      },
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err.message);
  });

  await redisClient.connect();
  console.log("Connected to Redis");
  return redisClient;
};
