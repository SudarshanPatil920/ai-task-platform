import redis from "../config/redis.js";

export const addTaskToQueue = async (task) => {
  await redis.lpush("task_queue", JSON.stringify(task));
};