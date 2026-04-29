import redis from "../config/redis.js";

export const addTaskToQueue = async (task) => {
  try {
    console.log("Pushing to Redis:", task);
    const queueLength = await redis.lpush("task_queue", JSON.stringify(task));
    console.log("Pushed successfully. Queue length:", queueLength);
  } catch (err) {
    console.error("Redis push failed:", err);
    throw err;
  }
};
