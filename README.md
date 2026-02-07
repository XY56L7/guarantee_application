# Guarantee Application

Full-stack application for managing warranty receipts: NestJS backend and Flutter (web/mobile) frontend.

---

## 📋 Table of contents

- [Prerequisites](#-prerequisites)
- [Localhost setup](#-localhost-setup)
- [Before commit and push](#-before-commit-and-push)
- [Docker](#-docker)
- [Documentation](#-documentation)

---

## 🔧 Prerequisites

- **Node.js** 20+ (backend)
- **npm** (backend)
- **Flutter** 3.24+ (frontend)
- **Git**

---

## 🚀 Localhost setup

### 1. Backend (API)

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (copy from `.env.example`):

```bash
cp .env.example .env
```

In `.env`, set at least:

- `JWT_SECRET` – strong secret key (min. 32 characters, e.g. `openssl rand -base64 32`)
- `FRONTEND_URL=http://localhost:8080` – for web frontend CORS

Start the backend:

```bash
npm run start:dev
```

The backend runs at **http://localhost:3000**.

### 2. Frontend (Flutter web)

```bash
cd frontend/guarantee_application
flutter pub get
```

First time only (if web support is not enabled yet):

```bash
flutter config --enable-web
```

Run in the browser:

```bash
flutter run -d web-server --web-port=8080
```

The frontend is available at **http://localhost:8080**. The backend must be running on port 3000.

### Quick reference

| Service     | Port | Command |
|------------|------|--------|
| Backend API | 3000 | `cd backend && npm run start:dev` |
| Frontend web | 8080 | `cd frontend/guarantee_application && flutter run -d web-server --web-port=8080` |

---

## ✅ Before commit and push

CI runs the same checks; run them locally before committing and pushing.

### Backend (`backend/`)

```bash
cd backend
npm ci
npm audit --audit-level=high
npm run lint
npx prettier --check "src/**/*.ts" "**/*.spec.ts"
npm run build
npm test
```

- **Fix lint:** `npm run lint` (includes --fix)
- **Format code:** `npm run format` (Prettier overwrites files)

### Frontend (`frontend/guarantee_application/`)

```bash
cd frontend/guarantee_application
flutter pub get
flutter analyze
flutter test
```

### Checklist before making a commit or a PR

- [ ] Backend: `npm run lint` passes
- [ ] Backend: `npx prettier --check "src/**/*.ts" "**/*.spec.ts"` passes (or no diff after `npm run format`)
- [ ] Backend: `npm run build` passes
- [ ] Backend: `npm test` passes
- [ ] Backend: `npm audit --audit-level=high` (no high/critical issues)
- [ ] Frontend: `flutter analyze` passes
- [ ] Frontend: `flutter test` passes
- [ ] No `.env` or secrets committed (keep `.env` in `.gitignore`)

---

## 🐳 Docker

Run the full stack with Docker:

```bash
docker-compose up --build
```

- Backend: http://localhost:3000  
- Frontend: http://localhost:8080  

Details: [DOCKER.md](./DOCKER.md)

---

## 📚 Documentation

- [Backend README](./backend/README.md) – API, architecture, security
- [Frontend README](./frontend/guarantee_application/README.md) – Flutter setup, run, features
- [SECURITY.md](./SECURITY.md) – security policy and reporting
- [DOCKER.md](./DOCKER.md) – Docker usage

---

## 🧪 Test accounts (backend seed)

- `user@example.com` / `User1234!`
- `admin@example.com` / `Admin1234!`
- `demo@example.com` / `Demo1234!`

---

## 📄 License

For private use.
