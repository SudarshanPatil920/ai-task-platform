import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import api from "./services/api";

const POLL_INTERVAL_MS = 5000;

function sortTasksByNewest(data) {
  return [...data].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function DashboardHome({
  tasks,
  loading,
  fetchTasks,
  setTasks,
  setSidebarOpen,
  totalTasks,
  activeTasks,
  completedTasks,
}) {
  return (
    <>
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
    </>
  );
}

function TasksPage({ tasks, loading, fetchTasks }) {
  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-hero">
          <p className="section-kicker">Tasks</p>
          <h2 className="dashboard-title">Task Activity</h2>
          <p className="dashboard-copy">
            Review the latest queue items and refresh task state on demand.
          </p>
        </div>
      </header>

      <section className="content-grid">
        <TaskList tasks={tasks} loading={loading} onRefresh={fetchTasks} />
      </section>
    </>
  );
}

function AppLayout() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFetchingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTasks = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      const res = await api.get("/tasks");
      setTasks(sortTasksByNewest(res.data));
    } catch (err) {
      console.error("Fetch error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(() => {
      fetchTasks();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [fetchTasks]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
            <button
              type="button"
              className={`sidebar-link ${
                location.pathname === "/dashboard" || location.pathname === "/"
                  ? "sidebar-link-active"
                  : ""
              }`}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`sidebar-link ${
                location.pathname === "/tasks" ? "sidebar-link-active" : ""
              }`}
              onClick={() => navigate("/tasks")}
            >
              Tasks
            </button>
            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            >
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
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <DashboardHome
                tasks={tasks}
                loading={loading}
                fetchTasks={fetchTasks}
                setTasks={setTasks}
                setSidebarOpen={setSidebarOpen}
                totalTasks={totalTasks}
                activeTasks={activeTasks}
                completedTasks={completedTasks}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TasksPage
                tasks={tasks}
                loading={loading}
                fetchTasks={fetchTasks}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
