import Task from "../models/Task.js";
import { addTaskToQueue } from "../services/queueService.js";

export const createTask = async (req, res) => {
  const { title, input, operation } = req.body;

  const task = await Task.create({ title, input, operation });

  await addTaskToQueue({
  _id: task._id.toString(),
  input: task.input,
  operation: task.operation
});

  res.json(task);
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
};