# AI Task Processing Platform

AI Task Processing Platform is a distributed task execution system built with React, Node.js, Python, MongoDB, and Redis. It supports secure user access, asynchronous task processing, background workers, Kubernetes deployment, Argo CD GitOps workflows, and CI/CD automation with GitHub Actions.

## Features

- User authentication with JWT
- Async task processing pipeline
- Redis queue with Python worker consumers
- Task status tracking from submission to completion
- Task logs and results on the dashboard
- Kubernetes deployment support
- Argo CD GitOps workflow
- CI/CD automation with GitHub Actions

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Worker: Python
- Database: MongoDB
- Queue: Redis
- DevOps: Docker, Kubernetes, Argo CD, GitHub Actions

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
README.md
docker-compose.yml
```

## Local Setup

### Prerequisites

- Docker
- Docker Compose

### Run the Full Stack

```bash
docker compose up --build
```

### Local Endpoints

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

## Kubernetes Setup

### Start a Local Cluster

```bash
minikube start
```

### Apply Kubernetes Manifests

```bash
kubectl apply -f infra/k8s
```

### Check Deployment Status

```bash
kubectl get all -n ai-task-platform
```

For shared or cloud clusters, update the image fields in `infra/k8s/*-deployment.yaml`
from local image names to registry images such as:

```text
<dockerhub-username>/ai-task-platform-backend:<tag>
<dockerhub-username>/ai-task-platform-frontend:<tag>
<dockerhub-username>/ai-task-platform-worker:<tag>
```

## Argo CD

Argo CD application manifest:

- `infra/argocd/application.yaml`

For the assignment, keep Kubernetes manifests in a separate infrastructure
repository and update `spec.source.repoURL` to that repository before applying
the Argo CD application.

### Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f infra/argocd/application.yaml
```

### Access the Dashboard

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open:

- `https://localhost:8080`

### Sync the Application

From the Argo CD UI, select the `ai-task-platform` app and click `Sync`.

CLI example:

```bash
argocd app sync ai-task-platform
```

## CI/CD

GitHub Actions workflow:

- `.github/workflows/deploy.yml`

The pipeline:

- checks out the code
- runs backend and frontend lint checks
- logs in to Docker Hub using GitHub Secrets
- builds Docker images for backend, frontend, and worker
- tags images with `latest` and the commit SHA
- pushes images automatically to Docker Hub
- optionally updates image tags in the infrastructure repository

Required secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `INFRA_REPO` for example `your-org/ai-task-platform-infra`
- `INFRA_REPO_TOKEN` with permission to push to the infra repository

Optional GitHub variable:

- `INFRA_MANIFEST_PATH`, defaults to `infra/k8s`

## Configuration and Security

- No secrets should be hardcoded in source code.
- Environment variables should be used for runtime configuration.
- Kubernetes Secrets should be used for production credentials.
- `.env` files should remain outside version control.
- Replace placeholder values in `infra/k8s/secret.yaml` before deployment.

## Screenshots

Capture and add screenshots before final submission:

- Login page
- Dashboard
- Task creation form
- Task status feed
- Kubernetes resources
- Argo CD application dashboard

Suggested local screenshot folder:

```text
docs/screenshots/
```

## Deployment Flow

The current working runtime flow remains:

`frontend -> backend -> redis -> worker -> mongo`

## Documentation

- Architecture details: [ARCHITECTURE.md](./ARCHITECTURE.md)
