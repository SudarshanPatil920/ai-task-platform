const statusMap = {
  pending: { label: "Pending", className: "status-pending" },
  running: { label: "Running", className: "status-running" },
  success: { label: "Success", className: "status-success" },
  failed: { label: "Failed", className: "status-failed" },
};

function getStatusConfig(status) {
  return statusMap[status] || statusMap.pending;
}

export default function TaskList({ tasks, loading, onRefresh }) {
  return (
    <section className="panel task-panel">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Tasks</p>
          <h2 className="panel-title">Latest task activity</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="task-list">
          <div className="task-grid">
            {tasks.map((task) => {
              const statusConfig = getStatusConfig(task.status);
              const isProcessing =
                task.status === "pending" || task.status === "running";

              return (
                <article key={task._id} className="task-card">
                  <div className="task-section">
                    <div className="task-card-header">
                      <div className="task-card-copy">
                        <h3 className="task-title">{task.title || "Untitled Task"}</h3>
                        <p className="task-operation">{task.operation}</p>
                      </div>
                      <span className={`status-badge ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="task-section">
                    <span className="task-section-label">Input</span>
                    <p className="task-text">{task.input}</p>
                  </div>

                  {task.status === "success" ? (
                    <div className="task-section">
                      <span className="task-section-label">Result</span>
                      <p className="task-text task-result">{task.result}</p>
                    </div>
                  ) : null}

                  {isProcessing ? (
                    <div className="task-section">
                      <span className="task-section-label">Progress</span>
                      <p className="task-text processing-text">Processing...</p>
                    </div>
                  ) : null}

                  {task.logs ? (
                    <div className="task-section">
                      <span className="task-section-label">Logs</span>
                      <p className="task-text task-logs">{task.logs}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
