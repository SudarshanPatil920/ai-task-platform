import { useEffect, useRef, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import api from "./services/api";

const POLL_INTERVAL_MS = 5000;

function sortTasksByNewest(data) {
  return [...data].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchTasks = async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      const res = await api.get("/api/tasks");
      setTasks(sortTasksByNewest(res.data));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(() => {
      fetchTasks();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((task) =>
    ["pending", "running"].includes(task.status)
  ).length;
  const completedTasks = tasks.filter((task) => task.status === "success").length;

  return (
    <div className="app-shell">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? "Close" : "Menu"}
      </button>

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div>
          <div className="brand-block">
            <div className="brand-mark">AI</div>
            <div>
              <p className="brand-eyebrow">Workspace</p>
              <h1 className="brand-title">AI Task Platform</h1>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button type="button" className="sidebar-link sidebar-link-active">
              Dashboard
            </button>
            <button type="button" className="sidebar-link">
              Tasks
            </button>
            <button type="button" className="sidebar-link">
              Logout
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <p className="sidebar-footer-label">Queue Health</p>
          <strong className="sidebar-footer-value">
            {activeTasks > 0 ? `${activeTasks} active tasks` : "All clear"}
          </strong>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <main className="main-content">
        <header className="dashboard-header">
          <div className="dashboard-hero">
            <p className="section-kicker">Dashboard</p>
            <h2 className="dashboard-title">AI Task Platform</h2>
            <p className="dashboard-copy">
              Submit work, watch the worker process it, and keep the latest task
              results in sync automatically.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total</span>
              <strong className="stat-value">{totalTasks}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active</span>
              <strong className="stat-value">{activeTasks}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <strong className="stat-value">{completedTasks}</strong>
            </div>
          </div>
        </header>

        <section className="content-grid">
          <TaskForm
            onTaskCreated={(task) => {
              setTasks((current) => sortTasksByNewest([task, ...current]));
              setSidebarOpen(false);
            }}
            onRefresh={fetchTasks}
          />
          <TaskList tasks={tasks} loading={loading} onRefresh={fetchTasks} />
        </section>
      </main>
    </div>
  );
}

export default App;
