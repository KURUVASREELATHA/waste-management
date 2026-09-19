# 🗑️ WasteWise — Waste Management System

A full-stack waste management platform connecting **citizens**, **municipal workers**, **recyclers**, and **municipality admins** with waste collection tracking, QR codes, GPS tracking, recycling orders, penalties, and earnings.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm**
- **MongoDB Atlas account** (cloud database — no local MongoDB needed)

### 1. Install dependencies
```sh
# Frontend (root folder)
npm install

# Backend
cd backend
npm install
```

### 2. Configure the database
The backend reads `backend/.env`. It is currently configured to use **MongoDB Atlas**:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.ccelcg0.mongodb.net/wastewise
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development

# Admin Credentials
ADMIN_EMAIL=a@g
ADMIN_PASSWORD=123
```

> ⚠️ Keep your Atlas username/password in `backend/.env` (already set). Original Atlas credentials file: `D:\downloads\atlas-credentials (2).env`. Never commit `.env` to version control.

### 3. Run the project

**Option A — One command each (recommended):**
```sh
# Terminal 1 — Backend (http://localhost:3001)
cd backend
npm start

# Terminal 2 — Frontend (http://localhost:5176)
npm run dev
```

**Option B — Batch scripts (Windows):**
| Script | What it does |
|--------|--------------|
| `start-system.bat` | Starts backend + frontend in separate windows |
| `start-backend.bat` | Backend only (nodemon) |
| `run-frontend.bat` | Frontend only |

### 4. Create the admin (first-time setup on a new database)
```sh
cd backend
node create-custom-admin.js
```

---

## 🔑 Login Credentials

### Admin (default, created via script)
| Field | Value |
|-------|-------|
| Email | `a@g` |
| Password | `123` |
| Role | **Admin** |

Login at **http://localhost:5176** and select **Admin** as the role.

> ⚠️ **Change these credentials before any production deployment.**

### Other roles
There are **no other users by default** — the database contains **real users only, no demo/test data**:

- **Citizens** — self-register from the login page
- **Recyclers** — self-register from the login page
- **Workers** — created by the admin from the dashboard

---

## 🌐 URLs & Ports

| Service | URL |
|---------|-----|
| Frontend (Vite + React) | http://localhost:5176 |
| Backend API (Express) | http://localhost:3001 |
| Backend health check | http://localhost:3001/api/health |
| Database | MongoDB Atlas → `wastewise` database |

Mobile testing: the frontend also binds to `0.0.0.0`, so use your machine's LAN IP, e.g. `http://<your-ip>:5176`.

---

## 🛠️ Tech Stack

**Frontend**
- Vite, React 18, TypeScript
- shadcn/ui + Tailwind CSS
- React Router, TanStack Query, React Hook Form + Zod
- Leaflet (maps), Recharts (charts), qrcode.react, html5-qrcode, TensorFlow.js (waste classification)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT auth, bcryptjs (password hashing)
- Multer (file uploads)

---

## 📁 Project Structure

```
├── src/                  # React frontend source
├── backend/
│   ├── server.js         # Express entry point (port 3001)
│   ├── routes/           # auth, waste, reports, penalties, qrcode, etc.
│   ├── models/           # Mongoose schemas
│   ├── middleware/       # Auth middleware
│   ├── services/         # Data sync service
│   └── .env              # DB URI + secrets (do not commit)
├── *.bat                 # Windows start scripts
└── *.md                  # Feature/fix documentation
```

---

## 🩺 Troubleshooting

- **Backend health check** — `http://localhost:3001/api/health` should return `{"status":"ok","database":"connected"}`.
- **"Unable to connect" on frontend** — make sure the backend is running; the frontend API calls go to `localhost:3001`.
- **MongoDB connection failed** — verify the Atlas cluster is running, your IP is whitelisted in Atlas (Network Access), and credentials in `backend/.env` are correct.
- **Restarting after DB change** — kill the node process on port 3001, edit `backend/.env`, then `cd backend && npm start`.
- **Login says "Invalid role"** — the login request must include the correct role (admin/worker/citizen/recycler); the frontend sends this automatically via the role selector.
