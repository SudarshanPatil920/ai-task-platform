import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      const token = data?.token;

      if (!token) {
        throw new Error("Missing token in login response");
      }

      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      setError(
        loginError.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <main className="main-content">
        <section className="content-grid">
          <form className="panel form-panel" onSubmit={handleSubmit}>
            <div className="panel-header">
              <div>
                <p className="section-kicker">Authentication</p>
                <h1 className="panel-title">Sign in to continue</h1>
              </div>
            </div>

            <div className="form-grid">
              <label className="field-group">
                <span className="field-label">Email</span>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">Password</span>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </label>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Signing in..." : "Login"}
              </button>
            </div>

            <p className="task-text">
              New user? <Link to="/register">Register first</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
