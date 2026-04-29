import Task from "../models/Task.js";
import { addTaskToQueue } from "../services/queueService.js";

export const createTask = async (req, res) => {
  try {
    const { title, input, operation } = req.body;
    console.log("API HIT");

    const task = await Task.create({
      title,
      input,
      operation,
      status: "pending",
    });

    console.log("Task created:", task._id);

    await addTaskToQueue({
      _id: task._id.toString(),
      input: task.input,
      operation: task.operation,
    });

    console.log("Task sent to Redis");

    res.json(task);
  } catch (err) {
    console.error("Error in createTask:", err);
    res.status(500).json({ message: "Error creating task" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};
