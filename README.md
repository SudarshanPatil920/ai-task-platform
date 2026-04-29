# AI Task Processing Platform

AI Task Processing Platform is a distributed task execution system built with React, Node.js, Python, MongoDB, and Redis. It supports secure user access, asynchronous task processing, background workers, Kubernetes deployment, Argo CD GitOps workflows, and CI/CD automation with GitHub Actions.

## Features

- User authentication with JWT
- Async task processing pipeline
- Redis queue with Python worker consumers
- Task status tracking from submission to completion
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
docker-compose up --build
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

## Argo CD

Argo CD application manifest:

- `infra/argocd/application.yaml`

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
- logs in to Docker Hub using GitHub Secrets
- builds Docker images for backend, frontend, and worker
- tags images with `latest` and the commit SHA
- pushes images automatically to Docker Hub

Required secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Configuration and Security

- No secrets should be hardcoded in source code.
- Environment variables should be used for runtime configuration.
- Kubernetes Secrets should be used for production credentials.
- `.env` files should remain outside version control.

## Screenshots

Add screenshots here:

- Login page
- Dashboard
- Task creation form
- Task status feed
- Kubernetes resources
- Argo CD application dashboard

## Deployment Flow

The current working runtime flow remains:

`frontend -> backend -> redis -> worker -> mongo`

## Documentation

- Architecture details: [ARCHITECTURE.md](./ARCHITECTURE.md)
