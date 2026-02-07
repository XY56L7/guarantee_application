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
# JWT Secret - REQUIRED: Must be at least 32 characters, contain uppercase, lowercase, numbers, and special characters
# Generate a new strong secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
# CORS - Frontend URL (required in production)
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

### Biztonsági követelmények

**Jelszó követelmények:**
- Minimum 8 karakter hosszú
- Tartalmaznia kell legalább 1 nagybetűt (A-Z)
- Tartalmaznia kell legalább 1 kisbetűt (a-z)
- Tartalmaznia kell legalább 1 számot (0-9)
- Tartalmaznia kell legalább 1 speciális karaktert (!@#$%^&*()_+-=[]{}...)

**Fiók biztonság:**
- 5 sikertelen bejelentkezési kísérlet után a fiók 15 percre zárolásra kerül
- Automatikus feloldás időtúllépés után

**Rate limiting:**
- Globális limit: 10 kérés/perc
- Auth endpointok: 5 kérés/perc (signup, login)

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
- **helmet**: HTTP biztonsági header-ök
- **@nestjs/throttler**: Rate limiting
- **sanitize-html**: XSS védelem

## 🔒 Biztonsági funkciók

1. **Erős jelszókövetelmények**: 8+ karakter, nagybetű, kisbetű, szám és speciális karakter
2. **Fiók zárolás**: 5 sikertelen kísérlet után 15 perces zárolás
3. **Rate limiting**: Kéréskorlát globálisan és auth endpointokon
4. **Input sanitizáció**: XSS és injection támadások elleni védelem
5. **Fájl validáció**: Képfájl típus és méret ellenőrzés
6. **Security logging**: Biztonsági események naplózása
7. **HTTPS kényszerítés**: Production környezetben automatikus átirányítás
8. **Request méret limit**: Maximum 10MB kérésméret
9. **CORS védelem**: Környezetfüggő origin ellenőrzés
10. **Access + refresh token**: Rövid életű access (15 perc), hosszú életű refresh (7 nap), token blacklist logoutra
11. **Egyedi token azonosító (jti)**: Minden token egyedi UUID-t kap, így a blacklist csak azt a konkrét kiállítást érinti, nem minden hasonló tokent

## 🧪 Teszt fiókok

A következő teszt fiókok automatikusan létrejönnek:

- `user@example.com` / `User1234!`
- `admin@example.com` / `Admin1234!`
- `demo@example.com` / `Demo1234!`

## 📝 Megjegyzések

- Jelenleg in-memory adatbázist használ (fejlesztési célokra)
- Éles környezetben valódi adatbázist (MongoDB, PostgreSQL) kell használni
- A repository réteg könnyen cserélhető valódi adatbázis implementációra
