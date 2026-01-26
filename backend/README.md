# Guarantee Application Backend - NestJS

Backend API NestJS-sel és Express.js-sel, Clean Architecture elvekkel.

## 🏗️ Architektúra

A projekt Clean Architecture elveit követi 4 réteggel:

- **Domain Layer**: Üzleti logika, entitások, repository interfészek
- **Application Layer**: Use cases, DTOs
- **Infrastructure Layer**: Repository implementációk, külső szolgáltatások
- **Persistence Layer**: Adatbázis kezelés, seed adatok

Részletes dokumentáció: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Telepítés

```bash
# Függőségek telepítése
npm install
```

## ⚙️ Konfiguráció

Hozz létre egy `.env` fájlt a backend könyvtárban:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
```

## 🏃 Futtatás

```bash
# Fejlesztési módban (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Egyszerű futtatás
npm start
```

## 📋 API Endpointok

### Publikus

- `GET /` - API információ
- `GET /api/health` - Health check
- `POST /api/auth/signup` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés

### Védett (JWT token szükséges)

- `POST /api/auth/verify` - Token ellenőrzés
- `GET /api/users/profile` - Profil lekérése
- `PUT /api/users/profile` - Profil frissítése
- `GET /api/guarantee-checks` - Garanciális számlák listázása
- `GET /api/guarantee-checks/:id` - Garanciális számla lekérése
- `POST /api/guarantee-checks` - Garanciális számla létrehozása
- `PUT /api/guarantee-checks/:id` - Garanciális számla frissítése
- `DELETE /api/guarantee-checks/:id` - Garanciális számla törlése
- `GET /api/guarantee-checks/stats/summary` - Statisztikák

## 🛠️ Technológiai Stack

- **NestJS**: Moduláris, dependency injection alapú framework
- **Express.js**: HTTP szerver (NestJS alatt)
- **TypeScript**: Típusbiztonság
- **JWT**: Autentikáció
- **bcrypt**: Jelszó hash-elés
- **class-validator**: DTO validáció

## 📝 Megjegyzések

- Jelenleg in-memory adatbázist használ (fejlesztési célokra)
- Éles környezetben valódi adatbázist (MongoDB, PostgreSQL) kell használni
- A repository réteg könnyen cserélhető valódi adatbázis implementációra
