# Guarantee Application - Frontend

Flutter alapú mobilalkalmazás garanciális számlák kezelésére és nyomon követésére.

## 📋 Tartalomjegyzék

- [Áttekintés](#áttekintés)
- [Funkciók](#funkciók)
- [Technológiai stack](#technológiai-stack)
- [Előfeltételek](#előfeltételek)
- [Gyors kezdés - Böngészőben futtatás](#-gyors-kezdés---böngészőben-futtatás)
- [Telepítés és futtatás](#telepítés-és-futtatás)
- [Projekt struktúra](#projekt-struktúra)
- [Főbb komponensek](#főbb-komponensek)
- [API integráció](#api-integráció)
- [Adatbázis](#adatbázis)
- [Fejlesztés](#fejlesztés)

## 🎯 Áttekintés

A Guarantee Application egy Flutter alapú mobilalkalmazás, amely lehetővé teszi a felhasználók számára, hogy digitálisan tárolják és kezeljék garanciális számláikat. Az alkalmazás segít nyomon követni a garanciális időszakokat, figyelmeztet lejárat előtt, és automatikusan észleli a lejárt garanciákat.

## ✨ Funkciók

### Hitelesítés
- **Bejelentkezés**: Email és jelszó alapú bejelentkezés
- **Regisztráció**: Új felhasználói fiók létrehozása
- **Biztonságos tárolás**: JWT token alapú autentikáció Flutter Secure Storage használatával
- **Munkamenet kezelés**: Automatikus kijelentkezés 15 perc inaktivitás után

### Garanciális számlák kezelése
- **Hozzáadás**: Új garanciális számla hozzáadása képpel és részletekkel
- **Listázás**: Összes garanciális számla megjelenítése státusz szerint
- **Keresés**: Keresés üzlet vagy termék neve szerint
- **Megtekintés**: Részletes nézet egy garanciális számláról
- **Törlés**: Garanciális számla törlése

### Státusz követés
- **Érvényes**: Zöld színnel jelölt, aktív garanciák
- **Hamarosan lejár**: Narancssárga színnel jelölt, 30 napon belül lejáró garanciák
- **Lejárt**: Piros színnel jelölt, lejárt garanciák
- **Statisztikák**: Összesített nézet az összes, lejárt, hamarosan lejáró és érvényes garanciákról

### Képkezelés
- **Képfeltöltés**: Kép kiválasztása galériából vagy kamerából
- **Képtárolás**: Lokális fájlrendszerben történő tárolás
- **Képmegjelenítés**: Garanciális számlák képeinek megjelenítése

### OCR és validáció (jelenleg kikapcsolva)
- **Szövegfelismerés**: Automatikus szövegfelismerés garanciális számlákról (Google ML Kit)
- **Validáció**: Automatikus garancia kizárási feltételek észlelése
- **Adatkinyerés**: Automatikus üzletnév, terméknév, dátum kinyerése

### Dummy adatok
- **Tesztelés**: Dummy adatok betöltése fejlesztési és tesztelési célokra
- **Adattörlés**: Összes adat törlése tesztelési célokra

## 🛠 Technológiai stack

- **Framework**: Flutter 3.38.6
- **Nyelv**: Dart 3.10.7
- **Adatbázis**: SQLite (sqflite)
- **HTTP kliens**: http package
- **Biztonságos tárolás**: flutter_secure_storage
- **Képkezelés**: image_picker, path_provider
- **Dátum formázás**: intl
- **UI**: Material Design 3

## 📦 Előfeltételek

- Flutter SDK 3.38.6 vagy újabb
- Dart SDK 3.10.7 vagy újabb
- Android Studio / Xcode (mobil fejlesztéshez)
- Visual Studio Code vagy Android Studio (ajánlott IDE)
- Git

## ⚡ Gyors kezdés - Böngészőben futtatás

Ha gyorsan szeretnéd kipróbálni az alkalmazást böngészőben:

1. **Navigálj a projekt könyvtárába:**
```bash
cd frontend/guarantee_application
```

2. **Telepítsd a függőségeket:**
```bash
flutter pub get
```

3. **Engedélyezd a web támogatást (első alkalommal):**
```bash
flutter config --enable-web
```

4. **Indítsd el a backend szervert** (ha még nem fut):
```bash
cd ../../backend
npm start
```

5. **Futtasd a Flutter alkalmazást web-server módban:**
```bash
cd ../frontend/guarantee_application
flutter run -d web-server --web-port=8080
```

6. **Nyisd meg a böngészőt:**
- Menj a `http://localhost:8080` címre
- Az alkalmazás betöltődik és használható lesz

**Megjegyzés:** Ha a `web-server` mód nem működik, próbáld meg a `flutter run -d chrome` parancsot, vagy nézd meg a részletes útmutatót lentebb.

## 🚀 Telepítés és futtatás

### 1. Projekt klónozása

```bash
cd guarantee_application/frontend/guarantee_application
```

### 2. Függőségek telepítése

```bash
flutter pub get
```

### 3. Web támogatás engedélyezése (első alkalommal)

Ha még nem engedélyezted a web támogatást:

```bash
flutter config --enable-web
```

### 4. Alkalmazás futtatása

**Általános futtatás (automatikusan kiválasztja az elérhető eszközt):**
```bash
flutter run
```

**Konkrét platform kiválasztása:**

**Web böngészőben:**

A Flutter alkalmazást több módon is futtathatod böngészőben:

**1. Opció: Chrome automatikus indítás (ha működik):**
```bash
flutter run -d chrome
```

**2. Opció: Web-server mód (ajánlott, ha a Chrome automatikus indítás nem működik):**
```bash
flutter run -d web-server --web-port=8080
```
Ez egy web szervert indít a `http://localhost:8080` címen. Miután látod a "Flutter run key commands" üzenetet, nyisd meg a böngészőt és menj a `http://localhost:8080` címre.

**3. Opció: Build és statikus szerver:**
```bash
# Build a web verziót
flutter build web

# Indíts egy HTTP szervert (Python példa)
cd build/web
python -m http.server 8080
```

Vagy Node.js http-server használatával:
```bash
# Telepítsd a http-server-t (ha még nincs)
npm install -g http-server

# Build és szerver indítás
flutter build web
cd build/web
http-server -p 8080
```

**Fontos megjegyzések web futtatáshoz:**
- A backend szervernek futnia kell a `http://localhost:3000` címen
- A web verzióban bizonyos funkciók korlátozottak (pl. kamerahasználat)
- Az első build hosszabb ideig tarthat, mert a Flutter letölti a szükséges web-eszközöket
- Ha a Chrome automatikus indítása nem működik, használd a `web-server` módot

**Hibaelhárítás web futtatáshoz:**

Ha a `flutter run -d chrome` parancs hibát ad ("Failed to launch browser"), próbáld meg:
1. A `web-server` módot: `flutter run -d web-server --web-port=8080`
2. Vagy build-eld és indíts egy statikus szervert (lásd fent)

**Windows desktop:**
```bash
flutter run -d windows
```

**Android emulátor/eszköz:**
```bash
flutter run -d android
```

**iOS (csak macOS-en):**
```bash
flutter run -d ios
```

### 4. Elérhető eszközök listázása

```bash
flutter devices
```

### 5. További hasznos parancsok

**Hot reload (futás közben):**
- Nyomd meg az `r` billentyűt a terminálban

**Hot restart:**
- Nyomd meg az `R` billentyűt a terminálban

**Debug módban futtatás:**
```bash
flutter run --debug
```

**Release módban futtatás:**
```bash
flutter run --release
```

## 📁 Projekt struktúra

```
lib/
├── main.dart                          # Alkalmazás belépési pontja
├── database/
│   └── database_helper.dart           # SQLite adatbázis kezelő
├── models/
│   └── guarantee_check.dart           # Garanciális számla modell
├── screens/
│   ├── login_screen.dart              # Bejelentkezési képernyő
│   ├── signup_screen.dart             # Regisztrációs képernyő
│   ├── main_screen.dart               # Főképernyő (bottom navigation)
│   ├── home_screen.dart               # Főoldal (garanciális számlák listája)
│   ├── add_guarantee_check_screen.dart # Új garanciális számla hozzáadása
│   ├── view_guarantee_check_screen.dart # Garanciális számla részletes nézete
│   └── profile_screen.dart            # Profil képernyő
├── services/
│   ├── api_service.dart               # Backend API integráció
│   ├── dummy_data_service.dart        # Dummy adatok szolgáltatás
│   ├── guarantee_validation_service.dart # Garancia validáció
│   └── ocr_service.dart               # OCR szolgáltatás (jelenleg kikapcsolva)
└── widgets/
    ├── auth_guard.dart                # Hitelesítés védő widget
    └── session_timeout_widget.dart     # Munkamenet timeout kezelő
```

## 🔧 Főbb komponensek

### DatabaseHelper
SQLite adatbázis kezelő singleton osztály, amely kezeli:
- Garanciális számlák CRUD műveleteit
- Keresési funkciókat
- Lejárt és hamarosan lejáró garanciák szűrését
- Képek törlését adatbázis rekord törlésekor

### ApiService
Backend API integráció kezelője:
- Bejelentkezés és regisztráció
- JWT token kezelés
- Felhasználói profil lekérdezése
- Platform-specifikus base URL (Android: 10.0.2.2, Web: localhost)

### GuaranteeCheck Model
Garanciális számla adatmodell:
- Alapvető mezők (üzlet, termék, dátumok, kép)
- Automatikus lejárat ellenőrzés (`isExpired`, `expiresSoon`)
- JSON serializáció/deserializáció

### GuaranteeValidationService
Garancia validációs szolgáltatás:
- Kizárási feltételek észlelése regex pattern-ekkel
- Figyelmeztetések azonosítása
- Automatikus adatkinyerés (üzletnév, terméknév, dátumok)

## 🌐 API integráció

Az alkalmazás egy backend API-val kommunikál. Az API base URL platform-specifikus:

- **Web**: `http://localhost:3000/api`
- **Android**: `http://10.0.2.2:3000/api`
- **iOS/macOS**: `http://localhost:3000/api`

### API végpontok

- `POST /api/auth/login` - Bejelentkezés
- `POST /api/auth/signup` - Regisztráció
- `GET /api/auth/profile` - Felhasználói profil lekérdezése

### Autentikáció

Az API JWT token alapú autentikációt használ. A token a Flutter Secure Storage-ban van tárolva, és automatikusan hozzáadódik az API kérésekhez.

## 💾 Adatbázis

Az alkalmazás SQLite adatbázist használ lokális adattárolásra. Az adatbázis fájl az alkalmazás dokumentumok könyvtárában található: `guarantee_checks.db`

### Adatbázis séma

```sql
CREATE TABLE guarantee_checks(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storeName TEXT NOT NULL,
  productName TEXT NOT NULL,
  purchaseDate TEXT NOT NULL,
  expiryDate TEXT NOT NULL,
  imagePath TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL
)
```

## 🔒 Biztonság

- **JWT token tárolás**: Flutter Secure Storage használata biztonságos token tárolásra
- **Munkamenet timeout**: Automatikus kijelentkezés 15 perc inaktivitás után
- **Auth Guard**: Védett útvonalak, amelyek hitelesítést igényelnek

## 🎨 UI/UX

- **Material Design 3**: Modern, letisztult felhasználói felület
- **Reszponzív design**: Különböző képernyőméretekhez optimalizálva
- **Színkódolt státuszok**: Vizuális visszajelzés a garanciák státuszáról
- **Pull-to-refresh**: Frissítés húzással
- **Keresés**: Valós idejű keresés garanciális számlák között

## 🧪 Fejlesztés

### Dummy adatok használata

Az alkalmazás tartalmaz egy dummy adatok szolgáltatást, amely tesztelési célokra használható:

- Dummy adatok betöltése a menüből vagy az üres állapot képernyőről
- Összes adat törlése a menüből

### Hot Reload

Flutter hot reload funkciója lehetővé teszi a gyors fejlesztést:
- `r` - Hot reload (gyors frissítés)
- `R` - Hot restart (teljes újraindítás)
- `q` - Kilépés

### Build konfigurációk

**Debug build:**
```bash
flutter build apk --debug
flutter build ios --debug
```

**Release build:**
```bash
flutter build apk --release
flutter build ios --release
```

## 📝 Megjegyzések

- Az OCR funkció jelenleg kikapcsolva van a `pubspec.yaml` fájlban (google_mlkit_text_recognition kikommentezve)
- Az alkalmazás offline működést támogat lokális adatbázis használatával
- A képek az alkalmazás dokumentumok könyvtárában vannak tárolva

## 🤝 Közreműködés

1. Forkold a projektet
2. Hozz létre egy feature branch-et (`git checkout -b feature/AmazingFeature`)
3. Commitolj változtatásokat (`git commit -m 'Add some AmazingFeature'`)
4. Pushold a branch-et (`git push origin feature/AmazingFeature`)
5. Nyiss egy Pull Request-et

## 📄 Licenc

Ez a projekt privát használatra készült.

## 👤 Kapcsolat

Kérdések vagy problémák esetén kérjük, nyiss egy issue-t a projekt repository-ban.
