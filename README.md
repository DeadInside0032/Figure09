# Üzenetküldő Webes Alkalmazás

Egy teljes körű, reszponzív üzenetküldő alkalmazás **React**, **Express** és **PostgreSQL/Neon** technológiákkal.

## 🎯 Projektkésználőség

- ✅ **Autentikáció**: Regisztráció és bejelentkezés JWT tokenekkel
- ✅ **Üzenetkezelés**: Üzenet küldése és fogadása felhasználók között
- ✅ **Felhasználó kezelés**: Felhasználók listázása és törlése
- ✅ **Reszponzív design**: Mobilra, tablettre és desktopra optimalizált
- ✅ **4+ oldal routing**: Dashboard, Üzenetek, Felhasználók, Login/Register

## 🚀 Gyors indítás

### Előfeltételek
- Node.js 16+
- npm vagy yarn
- Neon PostgreSQL account

### 1. Neon Adatbázis Beállítása

[Részletes útmutató: NEON_SETUP.md](./NEON_SETUP.md)

Röviden:
```bash
# .env fájl létrehozása
cp react-app/.env.example react-app/.env

# DATABASE_URL módosítása a Neon connection stringből
nano react-app/.env
```

### 2. Telepítés és Indítás

```bash
# Függőségek telepítése
cd react-app
npm install

# Backend szerver indítása (Terminal 1)
node src/backend/express.cjs

# Frontend indítása (Terminal 2)
npm run dev
```

Nyisd meg: **http://localhost:5173**

## 📁 Projekt Szerkezet

```
├── react-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Bejelentkezés
│   │   │   ├── Register.jsx       # Regisztráció
│   │   │   ├── Dashboard.jsx      # Főoldal
│   │   │   ├── Messages.jsx       # Üzenet kezelés
│   │   │   └── Users.jsx          # Felhasználó lista
│   │   ├── components/
│   │   │   └── Navbar.jsx         # Navigáció
│   │   ├── backend/
│   │   │   └── express.cjs        # API szerver
│   │   ├── App.jsx                # Routing
│   │   ├── App.css                # Stílusok
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── NEON_SETUP.md                  # Neon beállítási útmutató
├── QUICK_START.md                 # Gyors indítás
└── README.md                       # Ez a fájl
```

## 🛠 Technológiai Stack

### Frontend
- **React 19** - UI keretrendszer
- **React Router DOM 7** - Útválasztás (4+ oldal)
- **Axios** - HTTP kérések
- **Vite** - Build eszköz
- **CSS3** - Reszponzív stílus

### Backend
- **Express.js** - REST API szerver
- **PostgreSQL** - Adatbázis (Neon)
- **bcryptjs** - Jelszótitkosítás
- **jsonwebtoken** - JWT autentikáció
- **CORS** - Szerver-kliens kommunikáció

## 📡 API Végpontok

### Auth
```
POST   /api/auth/register     - Regisztráció
POST   /api/auth/login        - Bejelentkezés
```

### Felhasználók
```
GET    /api/users             - Összes felhasználó
GET    /api/users/:id         - Egy felhasználó
DELETE /api/users/:id         - Felhasználó törlés
```

### Üzenetek
```
GET    /api/messages          - Bejelentkezett felhasználó üzenetei
POST   /api/messages          - Üzenet küldése
GET    /api/messages/:userId  - Üzenetek egy felhasználóval
```

### Egyéb
```
GET    /api/stats             - Statisztikák
GET    /api/health            - Health check
```

## 🔐 Biztonsági Megoldások

- **Jelszó titkosítás**: bcryptjs (10 salt rounds)
- **JWT autentikáció**: 24 órás token lejárat
- **Paraméteres lekérdezések**: SQL injection elleni védelem
- **CORS**: Köztudott origin kezelés
- **Token validáció**: Minden API végponton

## 📱 Reszponzív Design Breakpointok

- **Desktop**: 1200px+
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px

## 🧪 Teszt Adatok

Regisztráció után bármilyen felhasználóadattal bejelentkezhetsz:

```
Felhasználó 1:
- Felhasználónév: alice
- Email: alice@example.com
- Jelszó: password123

Felhasználó 2:
- Felhasználónév: bob
- Email: bob@example.com
- Jelszó: password456
```

Majd tesztelheted az üzenetküldést közöttük!

## 📚 Adatbázis Schema

### users tábla
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### messages tábla
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(id),
  recipient_id INT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Fejlesztői Parancsok

```bash
# Frontend fejlesztői szerver
npm run dev

# Frontend éles build
npm run build

# Linting
npm run lint

# Backend szerver
node src/backend/express.cjs

# Backend nodemon-nal (auto-reload)
npx nodemon src/backend/express.cjs
```

## 📖 Dokumentáció

- [Neon beállítási útmutató](./NEON_SETUP.md)
- [Gyors indítási útmutató](./QUICK_START.md)
- Express API: Lásd az [express.cjs](./react-app/src/backend/express.cjs) fájlt
- React komponensek: Lásd a `src/pages/` mappát

## 🐛 Hibaelhárítás

### CORS hiba
```
❌ Access to XMLHttpRequest blocked by CORS policy
```
**Megoldás**: Ellenőrizd, hogy az Express szerver fut-e `http://localhost:3001`

### Database kapcsolási hiba
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Megoldás**: Frissítsd a `.env` fájlban a DATABASE_URL-t, vagy lásd a [NEON_SETUP.md](./NEON_SETUP.md)-t

### Token lejárt
```
❌ 403 Forbidden - Invalid token
```
**Megoldás**: Tisztítsd meg a localStorage-t és jelentkezz be újra

## 📊 Fejlesztési roadmap

- [x] Alap projekt setup
- [x] React routing (4+ oldal)
- [x] Frontend komponensek
- [x] Express API
- [x] PostgreSQL integráció
- [x] JWT autentikáció
- [x] Reszponzív design
- [ ] Valós idejű üzenetkezelés (WebSocket)
- [ ] Üzenet keresés és szűrés
- [ ] Felhasználói profilok
- [ ] Offline támogatás

## 📄 Licenc

MIT License - Használható szabadon oktatási és személyes célokra.

## 🎓 Tanulási Cél

Ez a projekt bemutatja:
- Full-stack web development
- React modern gyakorlatok (Hooks, Router)
- REST API tervezés és fejlesztés
- Adatbázis kezelés
- Autentikáció és autorizáció
- Reszponzív webdesign
- Security best practices

---

**Kellemes fejlesztést!** 🚀

Kérdések vagy problémák? Nézd meg a [NEON_SETUP.md](./NEON_SETUP.md) vagy [QUICK_START.md](./QUICK_START.md) fájlokat!