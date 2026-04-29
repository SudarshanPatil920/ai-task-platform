import { useState } from "react";
import api from "../services/api";

const initialForm = {
  title: "",
  input: "",
  operation: "uppercase",
};

export default function TaskForm({ onTaskCreated, onRefresh }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.input.trim()) {
      setError("Title and input are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post(
        "/api/tasks",
        {
          title: form.title.trim(),
          input: form.input,
          operation: form.operation,
        }
      );

      setForm(initialForm);
      onTaskCreated?.(data);
      onRefresh?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError.response?.data?.message || "Failed to create task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="section-kicker">New Task</p>
          <h2 className="panel-title">Create a processing job</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="form-grid">
        <label className="field-group">
          <span className="field-label">Title</span>
          <input
            className="field-input"
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Enter task title"
          />
        </label>

        <label className="field-group">
          <span className="field-label">Operation</span>
          <select
            className="field-input"
            value={form.operation}
            onChange={(event) => updateField("operation", event.target.value)}
          >
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="reverse">Reverse</option>
            <option value="wordcount">Word Count</option>
          </select>
        </label>
      </div>

      <label className="field-group">
        <span className="field-label">Input</span>
        <textarea
          className="field-input field-textarea"
          rows="6"
          value={form.input}
          onChange={(event) => updateField("input", event.target.value)}
          placeholder="Enter the text to process"
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
