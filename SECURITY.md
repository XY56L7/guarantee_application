# Kiberbiztonsági megoldások – Guarantee Application

Ez a dokumentum a projektben implementált kiberbiztonsági intézkedéseket összegzi magyar nyelven.

---

## 1. Hitelesítés és jogosultságkezelés

### 1.1 Erős jelszókövetelmények
- **Minimum 8 karakter** hossz
- **Nagybetű** (A–Z)
- **Kisbetű** (a–z)
- **Szám** (0–9)
- **Speciális karakter** (!@#$%^&*()_+-=[]{};':"\\|,.<>/?)
- A validáció **backend** és **frontend** oldalon is fut (frontend: azonnali visszajelzés, backend: megbízható ellenőrzés).

### 1.2 Fiókzárolás (account lockout)
- **5 sikertelen** bejelentkezési kísérlet után a fiók **15 percre** zárolásra kerül.
- Automatikus feloldás az időtúllépés után.
- Sikeres bejelentkezéskor a sikertelen kísérletek számlálója nullázódik.

### 1.3 JWT token kezelés
- **Access token**: rövid életű (alapértelmezetten 15 perc), API hívásokhoz.
- **Refresh token**: hosszú életű (alapértelmezetten 7 nap), új access token igényléséhez.
- **Egyedi token azonosító (jti)**: minden kiállított token kap egy egyedi UUID-t, így a blacklist csak azt a konkrét tokent/sessiont érinti.
- **Token blacklist**: kijelentkezéskor az access és refresh token blacklistre kerül; blacklistelt tokenekkel nem lehet tovább hitelesített kérést intézni.
- **Token típus ellenőrzés**: a védett végpontok csak `type: 'access'` tokeneket fogadnak el.

### 1.4 JWT titok (JWT_SECRET) kezelése
- Indításkor **validáció**: minimum 32 karakter, nem lehet alapértelmezett/ismert érték.
- A titok csak a **backend**-en tárolódik, a frontend soha nem látja.
- Erős titok generálása: `openssl rand -base64 32`.

---

## 2. Rate limiting (kéréskorlát)

- **Globális limit**: 10 kérés / perc / kliens (ThrottlerGuard).
- **Auth végpontok** (login, signup): 5 kérés / perc.
- Csökkenti a brute-force és DoS jellegű próbálkozásokat.

---

## 3. HTTP és fejléc biztonság

### 3.1 Helmet.js
- Biztonsági HTTP fejlécek beállítása (X-Content-Type-Options, X-Frame-Options, stb.).
- XSS és clickjacking elleni alapvédelem.

### 3.2 HTTPS kényszerítés
- **Production** környezetben: ha a kérés nem HTTPS-en érkezik (`x-forwarded-proto`), a szerver átirányít HTTPS-re.

### 3.3 CORS
- **Production**: csak a `FRONTEND_URL` origin engedélyezett.
- **Development**: localhost és megadott fejlesztői URL-ek engedélyezettek.
- `credentials: true` csak megbízható originokkal.

---

## 4. Bemenet kezelése és validáció

### 4.1 Input sanitizáció
- **Globális sanitization interceptor**: minden bejövő `body`, `query` és `params` mező tisztítva (HTML/script injekció, XSS kockázat csökkentése).
- A `sanitize-html` csomaggal üres whitelist (nincs engedélyezett tag/attribútum) – gyakorlatban plain text marad.

### 4.2 Fájl / kép validáció
- Garanciális ellenőrzéseknél az **image path** validálva: engedélyezett kiterjesztések (.jpg, .jpeg, .png, .webp), max hossz, tiltott karakterek.
- Kérés méret limit: **maximum 10 MB** egy kéréshez; túllépés esetén 413 (Payload Too Large).

### 4.3 DTO validáció
- `class-validator` + `ValidationPipe`: whitelist, forbidNonWhitelisted, transform.
- Csak a definiált mezők fogadhatók, ismeretlen mezők elutasítva.

---

## 5. Biztonsági naplózás (security logging)

- **SecurityLogger** szolgáltatás a következő események rögzítéséhez:
  - Sikertelen bejelentkezés (user not found, wrong password, account locked).
  - Sikeres bejelentkezés.
  - Token validációs hiba (hiányzó/érvénytelen/lejárt token, blacklist).
  - Rate limit elérése (opcionális bővítéshez).
- A token ellenőrzés (JwtAuthGuard) hibái is naplózva.

---

## 6. Frontend biztonság

### 6.1 Validáció a kliensen
- **Email**: formátum ellenőrzés regex-szel (következetes a backend szabályokkal).
- **Jelszó**: ugyanazok a szabályok (8+ karakter, nagybetű, kisbetű, szám, speciális karakter).
- **Név**: nem üres, trim után sem.
- **Jelszó megerősítés**: egyezés ellenőrzése regisztrációnál.
- Cél: kevesebb felesleges API hívás, jobb felhasználói élmény; a backend validáció továbbra is kötelező.

### 6.2 Token tárolás (httpOnly cookie – megvalósítva)
- **Web**: A backend **httpOnly** cookie-kat állít be (accessToken, refreshToken). A token nem kerül localStorage-ba, a böngésző automatikusan csatolja a cookie-t a kérésekkel. A frontend **withCredentials: true** (BrowserClient) használatával küldi a cookie-t. XSS esetén a token **nem olvasható ki** JavaScriptből.
- **Mobil (Android/iOS)**: A token továbbra is a **FlutterSecureStorage**-ban marad, és az **Authorization** headerben kerül elküldésre (cookie nem megbízható minden mobil környezetben).
- Kijelentkezéskor a backend törli a cookie-kat, a frontend (web) a session jelzőt tisztítja.

---

## 7. CI/CD és függőségek

### 7.1 GitHub Actions (CI)
- **Backend**: `npm ci`, lint, Prettier ellenőrzés, build, tesztek.
- **npm audit**: `npm audit --audit-level=high` – high és critical sebezhetőségek esetén a pipeline fallal.
- **Frontend**: Flutter `pub get`, `flutter analyze`, `flutter test`.

### 7.2 Dependabot
- **npm** (backend): heti frissítési javaslatok, max 5 nyitott PR.
- **pub** (frontend): heti frissítési javaslatok, max 5 nyitott PR.
- A függőségek sebezhetőségei időben javíthatók.

---

## 8. Összefoglaló táblázat

| Terület              | Intézkedés                                      | Helye (backend/frontend/CI) |
|----------------------|--------------------------------------------------|-----------------------------|
| Jelszó               | Erős jelszókövetelmény, validáció                | Backend + frontend          |
| Fiókvédelem          | Account lockout (5 kísérlet, 15 perc)           | Backend                     |
| Tokenek              | Access + refresh, jti, blacklist                 | Backend                     |
| JWT titok             | Validáció, erős titok                            | Backend                     |
| Rate limiting        | Globális + auth végpontok                        | Backend                     |
| HTTP fejlécek        | Helmet                                           | Backend                     |
| HTTPS                | Kényszerítés productionban                       | Backend                     |
| CORS                 | Origin szűrés, környezetfüggő                    | Backend                     |
| Bemenet              | Sanitizáció, fájl path validáció, méret limit   | Backend                     |
| Naplózás             | SecurityLogger                                   | Backend                     |
| Frontend validáció   | Email, jelszó, név, confirm                      | Frontend                    |
| Függőségek           | npm audit, Dependabot                            | CI + GitHub                 |

---

## 9. Éles környezetre javasolt kiegészítések

- **Adatbázis**: valódi, perzisztens adatbázis (pl. PostgreSQL) és token/blacklist tárolás adatbázisban vagy Redis-ben.
- **Token tárolás**: httpOnly, Secure, SameSite cookie a tokene(k) számára, ahol lehetséges.
- **2FA/MFA**: kétfaktoros hitelesítés kritikus felhasználókhoz.
- **Jelszó visszaállítás**: email alapú, időkorlátos tokennel.
- **Email megerősítés**: regisztrációhoz.
- **Részletes audit napló**: ki, mikor, mit csinált (pl. adatbázisba).

---

*Utolsó frissítés: 2026-02-07*
