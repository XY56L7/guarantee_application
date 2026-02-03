# Docker – One-click local setup

Run the whole stack (backend + frontend in browser) with Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed

## One command

From the **repository root**:

```bash
docker compose up --build
```

- **Frontend (Flutter web):** open [http://localhost:8080](http://localhost:8080) in your browser  
- **Backend API:** [http://localhost:3000](http://localhost:3000) (e.g. [http://localhost:3000/api](http://localhost:3000/api))

The first run builds the images (backend installs npm packages and runs the app; frontend builds Flutter web and serves it with nginx). Later runs are faster if you only use `docker compose up`.

## Updating after code changes

After you change backend or frontend code, rebuild the images and start again:

```bash
docker compose up --build
```

This rebuilds only images whose build context (your code) changed and restarts the containers.

**Rebuild from scratch (no cache):**

```bash
docker compose build --no-cache
docker compose up
```

**Rebuild and run only one service:**

```bash
# Backend only
docker compose up --build backend

# Frontend only
docker compose up --build frontend
```

**If containers are already running:** stop them first, then rebuild and start:

```bash
docker compose down
docker compose up --build
```

## Optional: environment variables

- Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET` (and others) if you want.
- Or set `JWT_SECRET` when running:  
  `JWT_SECRET=your_secret docker compose up --build`

## Structure

| Path | Role |
|------|------|
| `backend/Dockerfile` | Backend: installs packages, builds and runs NestJS |
| `frontend/guarantee_application/Dockerfile` | Frontend: builds Flutter web, serves with nginx |
| `docker-compose.yml` (root) | Runs both services and exposes ports 3000 (API) and 8080 (web) |
