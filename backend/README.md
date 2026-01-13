# Backend API Dokumentáció

Ez a dokumentáció részletesen leírja a Guarantee Application backend API-jának összes endpointját.

## 📋 Tartalomjegyzék

- [Bevezetés](#bevezetés)
- [Telepítés és Indítás](#telepítés-és-indítás)
- [Autentikáció](#autentikáció)
- [API Endpointok](#api-endpointok)
  - [Publikus Endpointok](#publikus-endpointok)
  - [Védett Endpointok](#védett-endpointok)
- [Hibakezelés](#hibakezelés)
- [Tesztfelhasználók](#tesztfelhasználók)

## Bevezetés

A backend egy **Node.js** és **Express** alapú REST API, amely JWT token alapú autentikációt használ. A jelszavakat **bcrypt**-tel hash-eli, és szigorú CORS politikát alkalmaz.

**Alap URL:** `http://localhost:3000`

## Telepítés és Indítás

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Környezeti változók beállítása

Hozz létre egy `.env` fájlt a backend könyvtárban:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
```

### 3. Szerver indítása

```bash
npm start
```

A szerver a `http://localhost:3000` címen fog futni.

## Autentikáció

A védett endpointokhoz JWT token szükséges. A tokent a bejelentkezés vagy regisztráció után kapod meg.

**Token használata:**
- A token-t az `Authorization` header-ben kell küldeni
- Formátum: `Bearer <token>`

**Példa:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpointok

### Publikus Endpointok

#### 1. Főoldal - API Információ

**GET** `/`

Visszaadja az API alapinformációit.

**Válasz:**
```json
{
  "message": "Secure Backend API is running!",
  "version": "2.0.0",
  "features": [
    "Password Hashing (bcrypt)",
    "JWT Authentication",
    "Protected Routes",
    "Strict CORS Policy"
  ]
}
```

---

#### 2. Health Check

**GET** `/api/health`

Ellenőrzi, hogy a szerver fut-e.

**Válasz:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T17:33:06.600Z",
  "uptime": 8.2351408
}
```

---

#### 3. Regisztráció

**POST** `/api/auth/signup`

Új felhasználó regisztrálása.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Validáció:**
- `email`: kötelező, érvényes email formátum
- `password`: kötelező, minimum 6 karakter
- `name`: kötelező

**Sikeres válasz (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Hibás válaszok:**
- `400`: Hiányzó vagy érvénytelen adatok
- `409`: Az email már létezik
- `500`: Szerver hiba

---

#### 4. Bejelentkezés

**POST** `/api/auth/login`

Bejelentkezés email és jelszó alapján.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validáció:**
- `email`: kötelező
- `password`: kötelező

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Hibás válaszok:**
- `400`: Hiányzó adatok
- `401`: Érvénytelen email vagy jelszó
- `500`: Szerver hiba

---

### Védett Endpointok

> ⚠️ **Megjegyzés:** Minden védett endpointhoz szükséges az `Authorization: Bearer <token>` header.

---

#### 5. Profil Lekérése

**GET** `/api/auth/profile`

Visszaadja a bejelentkezett felhasználó profilját.

**Headers:**
```
Authorization: Bearer <token>
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User",
    "createdAt": "2026-01-13T17:33:06.600Z"
  }
}
```

**Hibás válaszok:**
- `401`: Hiányzó vagy érvénytelen token
- `404`: Felhasználó nem található

---

#### 6. Profil Frissítése

**PUT** `/api/auth/profile`

Frissíti a bejelentkezett felhasználó profilját.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Új Név",
  "password": "ujjelszo123"
}
```

> **Megjegyzés:** A `name` és `password` mezők opcionálisak. Csak azokat a mezőket kell küldeni, amelyeket frissíteni szeretnél.

**Validáció:**
- `password`: minimum 6 karakter (ha meg van adva)

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Új Név"
  }
}
```

**Hibás válaszok:**
- `400`: Érvénytelen jelszó hossz
- `401`: Hiányzó vagy érvénytelen token
- `404`: Felhasználó nem található
- `500`: Szerver hiba

---

#### 7. Felhasználók Listázása

**GET** `/api/users`

Visszaadja az összes regisztrált felhasználó listáját.

**Headers:**
```
Authorization: Bearer <token>
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "count": 3,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "Test User",
      "createdAt": "2026-01-13T17:33:06.600Z"
    },
    {
      "id": 2,
      "email": "admin@example.com",
      "name": "Admin User",
      "createdAt": "2026-01-13T17:33:06.600Z"
    }
  ]
}
```

**Hibás válaszok:**
- `401`: Hiányzó vagy érvénytelen token

---

#### 8. Token Ellenőrzése

**POST** `/api/auth/verify`

Ellenőrzi, hogy a token érvényes-e.

**Headers:**
```
Authorization: Bearer <token>
```

**Sikeres válasz (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "name": "Test User"
  }
}
```

**Hibás válaszok:**
- `401`: Hiányzó, érvénytelen vagy lejárt token

---

## Hibakezelés

### HTTP Státusz Kódok

- **200 OK**: Sikeres kérés
- **201 Created**: Sikeres létrehozás (regisztráció)
- **400 Bad Request**: Érvénytelen kérés adatok
- **401 Unauthorized**: Hiányzó vagy érvénytelen autentikáció
- **403 Forbidden**: Érvénytelen token
- **404 Not Found**: Endpoint vagy erőforrás nem található
- **409 Conflict**: Konfliktus (pl. email már létezik)
- **500 Internal Server Error**: Szerver hiba

### Hiba Válasz Formátum

```json
{
  "success": false,
  "message": "Hibaüzenet leírása"
}
```

### Példa Hiba Válaszok

**401 - Hiányzó token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**401 - Lejárt token:**
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

**400 - Érvénytelen email:**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**404 - Endpoint nem található:**
```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

---

## Tesztfelhasználók

A szerver indításakor automatikusan létrejön 3 tesztfelhasználó:

| Email | Jelszó | Név |
|-------|--------|-----|
| `user@example.com` | `password123` | Test User |
| `admin@example.com` | `admin123` | Admin User |
| `demo@example.com` | `demo123` | Demo User |

> **Fontos:** Ezek a felhasználók csak memóriában tárolódnak. A szerver újraindításakor újra létrejönnek.

---

## CORS Beállítások

A backend csak a következő eredetekről fogad kéréseket:

- `http://localhost:3000`
- `http://localhost:8080`
- `http://10.0.2.2:3000` (Android emulátor)
- Bármely `http://localhost:<port>` formátumú URL

---

## Biztonsági Megjegyzések

1. **Jelszó Hash-elés**: Minden jelszó bcrypt-tel hash-elődik (10 salt rounds)
2. **JWT Token**: A tokenek 1 óráig érvényesek (beállítható a `.env` fájlban)
3. **CORS**: Szigorú CORS politika csak engedélyezett eredetekről
4. **Memória tárolás**: ⚠️ A felhasználók csak memóriában tárolódnak (fejlesztési célokra)

> **Éles környezetben:** Használj adatbázist (pl. MongoDB, PostgreSQL) a felhasználók tárolásához!

---

## Példa Kérések

### cURL Példák

**Regisztráció:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123","name":"New User"}'
```

**Bejelentkezés:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Profil lekérése:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Profil frissítése:**
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Frissített Név"}'
```

---

## Technológiai Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **bcrypt**: Jelszó hash-elés
- **jsonwebtoken**: JWT token kezelés
- **cors**: CORS middleware
- **dotenv**: Környezeti változók kezelése

---

## Verzió

**API Verzió:** 2.0.0

---

## Licenc

ISC
