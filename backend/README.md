# Backend API

Node.js Express backend API a Flutter Camera App-hoz.

## Telepítés

```bash
npm install
```

## Futtatás

```bash
npm start
```

A szerver a `http://localhost:3000` címen fut.

## API Endpoints

### Health Check
- `GET /api/health` - Szerver állapot ellenőrzése

### Authentication

#### Login
- `POST /api/auth/login`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Test User"
    },
    "token": "dummy_token_1"
  }
  ```

#### Sign Up
- `POST /api/auth/signup`
- Body:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "user": {
      "id": 4,
      "email": "newuser@example.com",
      "name": "New User"
    }
  }
  ```

## Dummy Felhasználók

A backend tartalmaz három előre definiált dummy felhasználót:

1. **Test User**
   - Email: `user@example.com`
   - Password: `password123`

2. **Admin User**
   - Email: `admin@example.com`
   - Password: `admin123`

3. **Demo User**
   - Email: `demo@example.com`
   - Password: `demo123`

## Megjegyzések

- A jelenlegi implementáció memóriában tárolja a felhasználókat (nem perzisztens)
- A jelszavak nincsenek hash-elve (csak fejlesztési célokra)
- A token generálás dummy (produkcióban JWT-t használj)
- CORS engedélyezve van minden origin számára (fejlesztési célokra)

