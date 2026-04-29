# AI Task Platform

AI Task Platform is a MERN + Python worker application for asynchronous text-processing jobs. Users create tasks in the frontend, the backend persists them in MongoDB, Redis queues the work, and Python workers process the jobs before writing results back to MongoDB.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Worker: Python
- Database: MongoDB
- Queue: Redis
- Local orchestration: Docker Compose
- Cluster orchestration: Kubernetes
- GitOps: Argo CD

## Project Structure

```text
backend/
frontend/
worker/
infra/
  argocd/
  k8s/
.github/
  workflows/
ARCHITECTURE.md
docker-compose.yml
README.md
```

## Local Development

### Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose
- Node.js 20+ if running services outside containers
- Python 3.11+ if running the worker outside containers

### Start the Full Stack

```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## Docker Notes

### Production Container Images

- Backend uses a multi-stage Node image and runs as a non-root user.
- Frontend builds static assets and serves them with unprivileged NGINX.
- Worker runs on Python 3.11 slim with a virtual environment and non-root user.

### Compose Topology

The Compose stack preserves the existing runtime flow:

`Frontend -> Backend -> Redis -> Worker -> MongoDB`

The frontend uses same-origin `/api` calls. In local Vite development, `vite.config.js` proxies `/api` to the backend. In Docker Compose, NGINX forwards `/api` traffic from the frontend container to the backend container.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`

## Kubernetes Deployment

All manifests live in `infra/k8s/`.

### Included Resources

- Namespace
- ConfigMap
- Secret
- Mongo PVC
- Frontend deployment + service
- Backend deployment + service
- Worker deployment + service
- Mongo deployment + service
- Redis deployment + service
- Ingress

### Apply Manifests

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secret.yaml
kubectl apply -f infra/k8s/mongo-pvc.yaml
kubectl apply -f infra/k8s/
```

### Ingress Routing

- `/` routes to the frontend service
- `/api` routes to the backend service

Example host:

- `ai-task-platform.local`

Update your local hosts file if needed:

```text
127.0.0.1 ai-task-platform.local
```

## ConfigMaps And Secrets

### ConfigMap

`infra/k8s/configmap.yaml` contains non-sensitive runtime configuration such as:

- `NODE_ENV`
- `PORT`
- `REDIS_HOST`
- `REDIS_PORT`
- `DB_NAME`

### Secret

`infra/k8s/secret.yaml` contains placeholders for:

- `JWT_SECRET`
- `MONGO_URI`
- `MONGO_INITDB_ROOT_USERNAME`
- `MONGO_INITDB_ROOT_PASSWORD`

Replace those values before deploying.

## Argo CD Setup

Argo CD application manifest:

- `infra/argocd/application.yaml`

### Install Argo CD On Minikube Or K3s

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f infra/argocd/application.yaml
```

### Access Argo CD Locally

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then open:

- `https://localhost:8080`

Get the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
```

## CI/CD

GitHub Actions workflow:

- `.github/workflows/deploy.yml`

### What It Does

- Installs backend, frontend, and worker dependencies
- Runs lint commands when present
- Builds the frontend
- Builds and pushes backend, frontend, and worker Docker images
- Updates Kubernetes image tags in `infra/k8s/`
- Commits manifest updates back to the repository

### Required GitHub Secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Security Notes

The backend already includes:

- Helmet middleware
- Express rate limiting
- bcrypt password hashing
- JWT authentication

Production guidance:

- Keep `.env` files out of Git
- Rotate JWT secrets regularly
- Use Kubernetes Secrets or an external secret manager
- Prefer managed MongoDB and Redis in production

## Screenshots

Add screenshots here:

- Dashboard
- Create Task form
- Task feed
- Argo CD application view

## Operational Flow

1. User submits a task from the frontend.
2. Backend writes the task to MongoDB.
3. Backend pushes the task payload to Redis.
4. Worker consumes from Redis.
5. Worker processes the payload and updates MongoDB.
6. Frontend polls the backend and shows updated status and results.

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md)
