# AI Task Platform Architecture

## Overview

The platform uses a straightforward asynchronous processing pipeline:

1. The React frontend authenticates users and submits tasks to the backend API.
2. The Node.js backend validates the request, persists the task in MongoDB, and pushes a queue message to Redis.
3. The Python worker consumes queued jobs from Redis, processes the payload, and updates the matching MongoDB document.
4. The frontend polls the backend for task updates and renders the latest status and result.

This separation keeps the request-response path fast while allowing heavier work to happen outside the web tier.

## Runtime Components

### Frontend

- Built with React and Vite.
- Served as a static site in production from NGINX.
- Talks only to the backend API.
- Handles UI state, task creation, authentication token forwarding, and task polling.

### Backend

- Built with Express and ESM.
- Handles authentication, task creation, task listing, and queue publishing.
- Uses MongoDB for persistence and Redis for asynchronous job dispatch.
- Security middleware already present in the application includes Helmet, rate limiting, bcrypt password hashing, and JWT-based auth.

### Worker

- Runs as a separate Python deployment.
- Continuously listens on the Redis queue.
- Processes text transformation jobs and updates MongoDB with status and results.
- Designed to scale horizontally because each worker independently blocks on the same Redis list.

### Redis

- Used as the queue buffer between API writes and worker execution.
- Decouples user-facing latency from background processing latency.
- Lets the backend stay responsive during bursts of traffic.

### MongoDB

- Stores users, tasks, statuses, logs, and final results.
- Remains the source of truth for the frontend and for operational auditing.

## Worker Scaling Strategy

Worker scaling is intentionally simple:

- Scale the worker deployment replicas based on queue depth or CPU usage.
- Each worker competes for work using blocking Redis operations.
- No task routing changes are required when replicas increase.
- The worker deployment in Kubernetes can safely run more than one replica because queue consumption is shared.

For production, add Horizontal Pod Autoscaling based on CPU and, if available, Redis queue depth metrics from Prometheus or KEDA.

## Handling 100k Tasks Per Day

100k tasks per day is about 1.16 tasks per second on average, which is manageable for this architecture if burst handling is planned correctly.

Recommended approach:

- Keep the backend stateless and scale it horizontally behind a service.
- Run multiple worker replicas to absorb bursts.
- Separate CPU-heavy and lightweight task types in the future if workloads diversify.
- Add autoscaling around backend and worker deployments.
- Keep Redis on reliable storage or a managed high-availability offering for production.

Operationally:

- The backend should stay focused on writes and queue handoff.
- Workers should do the heavy lifting.
- Redis should buffer spikes so the system degrades gracefully instead of dropping work.

## Database Indexing Strategy

The most important task access pattern is "latest tasks first" for dashboard rendering.

Recommended indexes:

- `tasks.status + createdAt` for dashboard filters and recent processing views.
- `tasks.createdAt` descending for recent task listing.
- `tasks.userId + createdAt` if multi-user dashboards become a primary access pattern.

Why this matters:

- The frontend polls for the most recent tasks repeatedly.
- Sorting by `createdAt DESC` without an index becomes more expensive as task volume grows.
- Status-based analytics and admin screens benefit from targeted indexes early.

## Redis Failure Handling

Redis is the short-lived queue transport, so failure planning matters.

Current model:

- The backend writes a task to MongoDB first.
- The backend then pushes a queue record to Redis.
- The worker updates MongoDB as processing advances.

Failure considerations:

- If Redis is temporarily unavailable, task creation should fail visibly rather than silently.
- MongoDB still contains the created task, which provides a recovery trail.
- A replay job can later scan for `pending` tasks that never entered the queue and republish them.

Production recommendations:

- Use Redis persistence and backups where appropriate.
- Add queue replay tooling for stuck `pending` tasks.
- Monitor Redis memory, command latency, and connection saturation.
- Keep worker retry logic and fail-safe logging enabled so transient Redis outages do not silently drop jobs.
- Consider Redis Sentinel or a managed Redis service for failover.

## Staging vs Production Environments

### Staging

- Mirrors production topology with smaller replica counts.
- Uses a separate Kubernetes namespace, separate MongoDB, separate Redis, and separate secrets.
- Uses environment-specific ConfigMaps and Secrets.
- Validates manifests, deployment flow, and Argo CD sync behavior before promotion.

### Production

- Uses a dedicated production namespace, production-grade secrets, persistent data, backups, and monitoring.
- Runs multiple frontend, backend, and worker replicas.
- Uses controlled rollout strategies and image tagging.
- Restricts direct cluster changes in favor of GitOps through Argo CD.

## Deployment Model

### Local

- Docker Compose runs frontend, backend, worker, MongoDB, and Redis together.
- Best for development, testing, and demos.

### Kubernetes

- Each major component runs as its own deployment.
- ConfigMaps and Secrets provide environment-specific configuration.
- Ingress exposes frontend and backend using `/` and `/api`.
- Argo CD reconciles manifests continuously from Git.

## Observability Recommendations

To support production use, add:

- Centralized logs for backend and worker.
- Metrics for request rate, queue depth, task latency, and error rate.
- Alerts for failed pods, Redis connection issues, and rising `pending` task counts.
- Dashboards showing end-to-end task throughput and processing duration.

## Summary

This system is well aligned with asynchronous task execution:

- Frontend remains lightweight.
- Backend remains fast and stateless.
- Redis buffers work.
- Workers scale independently.
- MongoDB preserves durable task history.

With horizontal worker scaling, targeted database indexing, Redis recovery planning, and GitOps-based delivery, the platform can grow from a classroom project into a practical production deployment model.
