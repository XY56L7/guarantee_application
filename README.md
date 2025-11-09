# Application

Ez a projekt egy full-stack alkalmazás, amely Flutter frontend-et és Node.js backend-et tartalmaz.

## Projekt Struktúra

```
Application/
├── frontend/
│   └── flutter_camera_demo/    # Flutter frontend alkalmazás
├── backend/                     # Node.js backend API
│   ├── index.js
│   ├── package.json
│   └── node_modules/
└── README.md
```

## Frontend

A frontend egy Flutter alkalmazás, amely a `frontend/flutter_camera_demo/` mappában található.

### Futtatás

```bash
cd frontend/flutter_camera_demo
flutter run
```

## Backend

A backend egy Node.js Express API, amely a `backend/` mappában található.

### Telepítés

```bash
cd backend
npm install
```

### Futtatás

```bash
npm start
```

A szerver alapértelmezés szerint a `http://localhost:3000` címen fut.

### API Endpoints

- `GET /` - Főoldal
- `GET /api/health` - Health check endpoint

## Fejlesztés

A projekt monorepo struktúrában van szervezve, ahol a frontend és backend külön mappákban találhatóak.

