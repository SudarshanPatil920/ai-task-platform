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

taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Task", taskSchema);
