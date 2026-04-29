import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
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
      await api.post("/auth/register", { email, password });
      navigate("/login", { replace: true });
    } catch (registerError) {
      setError(
        registerError.response?.data?.message ||
          "Registration failed. Please try again."
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
                <h1 className="panel-title">Create your account</h1>
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
                  placeholder="Create your password"
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
                {submitting ? "Creating..." : "Register"}
              </button>
            </div>

            <p className="task-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
