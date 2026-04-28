import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: String,
    input: String,
    operation: {
      type: String,
      enum: ["uppercase", "lowercase", "reverse", "wordcount"],
    },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
    },
    result: String,
    logs: String,
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);