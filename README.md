# ✈️ Smart Travel Planner & Itinerary Builder

A full-stack travel planning platform that lets you plan trips, build day-by-day itineraries, track expenses, save favorite destinations, get smart recommendations, and share trips with friends — all in one beautifully designed app.

> **Monorepo:** React (Vite) frontend + Node/Express (MongoDB) backend.

---

## ✨ Features

- 🔐 **Authentication** — JWT-based register/login with protected routes
- 🧳 **Trip Management** — full CRUD with optimistic updates
- 🗺️ **Itinerary Builder** — day-by-day activity planning
- 💰 **Expense Tracking** — log costs and see running totals
- ⭐ **Favorite Destinations** — save places you love
- 🤝 **Trip Sharing** — generate public share links
- 💡 **Smart Recommendations** — tailored trip ideas
- 🎨 **Modern UI** — Tailwind CSS design system, responsive layout, warm travel-inspired palette

---

## 🏗️ Tech Stack

### Frontend

- **React 18** + **Vite 5**
- **React Router v6** (routing, protected routes, lazy loading)
- **TanStack Query v5** (server state, caching, mutations)
- **React Hook Form** + **Zod** (forms & validation)
- **Tailwind CSS 3** (custom design system)
- **Axios** (API client with interceptors)
- **Vitest** + **Testing Library** (tests)

### Backend

- **Node.js** + **Express**
- **MongoDB** + **Mongoose** ODM
- **JWT** authentication, **bcryptjs** password hashing
- **Helmet**, **CORS**, **express-validator**, **morgan**
- **Mocha** + **Chai** + **Supertest** (tests)

---

## 📁 Project Structure

```
STP-App/
├── backend/                 # Node/Express API
│   ├── app.js               # Express app (serves frontend build in production)
│   ├── server.js            # Server bootstrap (port fallback, graceful shutdown)
│   ├── src/
│   │   ├── config/          # database & environment config
│   │   ├── controllers/     # request handlers
│   │   ├── middleware/      # auth, error handling, logging, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── repositories/    # data-access layer
│   │   ├── routes/          # Express routers
│   │   ├── services/        # business logic (AuthService, etc.)
│   │   └── validators/      # request validators
│   ├── scripts/             # helper scripts (smoke tests)
│   └── tests/               # backend test suites
│
├── frontend/                # React (Vite) SPA
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js     # axios instance + token/401 handling
│   │   │   ├── endpoints.js  # centralized endpoint paths
│   │   │   └── services/     # per-domain API services
│   │   ├── components/
│   │   │   ├── ui/           # reusable primitives (Button, Card, Input, …)
│   │   │   └── layout/       # Navbar, Sidebar, MainLayout
│   │   ├── context/          # AuthContext, UIContext
│   │   ├── hooks/            # useTrips, useExpenses, useAuth, …
│   │   ├── lib/              # queryKeys
│   │   ├── pages/            # route pages
│   │   ├── routes/           # AppRoutes, ProtectedRoute
│   │   └── index.css         # Tailwind + design tokens
│   ├── scripts/start-all.ps1 # starts backend + frontend together
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 8
- **MongoDB** (Atlas connection string or local instance)

### 1. Clone

```bash
git clone https://github.com/Kikunmi/Smart-Travel-Planner-App.git
cd Smart-Travel-Planner-App
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🏃 Running the App

### Option A — Start both together (Windows / PowerShell)

```powershell
cd frontend
npm run start-all
```

Starts the backend (`http://localhost:5000`) and the frontend (`http://localhost:5173`).

### Option B — Run each separately

**Backend**

```bash
cd backend
npm run dev      # nodemon (development)
npm start        # production
```

**Frontend**

```bash
cd frontend
npm run dev      # Vite dev server
```

Open **http://localhost:5173** in your browser.

---

## 🧪 Testing

**Backend**

```bash
cd backend
npm test                 # run all tests
npm run test:coverage    # with coverage
```

**Frontend**

```bash
cd frontend
npm test                 # run once
npm run test:watch       # watch mode
npm run test:coverage    # with coverage
```

Verify the auth flow end-to-end against a running backend:

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-auth.ps1
```

---

## 📦 Production Build

Build the frontend, then run the backend — in production the Express server serves the built SPA from `frontend/dist` and falls back to `index.html` for client-side routes.

```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Start the backend in production mode
cd ../backend
$env:NODE_ENV="production"   # PowerShell (use `export NODE_ENV=production` on macOS/Linux)
npm start
```

The full app is then served from **http://localhost:5000**.

---

## 🔌 API Reference

Base URL: `http://localhost:5000`

### Health

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| GET    | `/api/health` | Server health status |

### Authentication

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/register` | Register a new user          |
| POST   | `/api/auth/login`    | Login and receive a JWT      |
| GET    | `/api/auth/profile`  | Get current user (protected) |

> **Password rules:** minimum 6 characters, must include an uppercase letter, a lowercase letter, and a number.

### Trips

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/trips`          | List trips          |
| GET    | `/api/trips/upcoming` | List upcoming trips |
| GET    | `/api/trips/:id`      | Get trip details    |
| POST   | `/api/trips`          | Create a trip       |
| PUT    | `/api/trips/:id`      | Update a trip       |
| DELETE | `/api/trips/:id`      | Delete a trip       |

### Itinerary

| Method | Endpoint                               | Description         |
| ------ | -------------------------------------- | ------------------- |
| GET    | `/api/trips/:tripId/itinerary`         | Get itinerary items |
| POST   | `/api/trips/:tripId/itinerary`         | Add an item         |
| PUT    | `/api/trips/:tripId/itinerary/:itemId` | Update an item      |
| DELETE | `/api/trips/:tripId/itinerary/:itemId` | Delete an item      |

### Expenses

| Method | Endpoint                                 | Description       |
| ------ | ---------------------------------------- | ----------------- |
| GET    | `/api/trips/:tripId/expenses`            | Get expenses      |
| POST   | `/api/trips/:tripId/expenses`            | Add an expense    |
| PUT    | `/api/trips/:tripId/expenses/:expenseId` | Update an expense |
| DELETE | `/api/trips/:tripId/expenses/:expenseId` | Delete an expense |

### Favorites

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | `/api/favorites`     | List favorites    |
| POST   | `/api/favorites`     | Add a favorite    |
| DELETE | `/api/favorites/:id` | Remove a favorite |

### Recommendations

| Method | Endpoint                             | Description                |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/api/recommendations`               | Get recommendations        |
| GET    | `/api/trips/:tripId/recommendations` | Recommendations for a trip |

### Sharing

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| POST   | `/api/trips/:tripId/share` | Create a share link         |
| GET    | `/api/share/:shareId`      | View a shared trip (public) |
| DELETE | `/api/share/:shareId`      | Revoke a share link         |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────┐
│                React (Vite)                   │
│  pages → hooks → api/services → axios client  │
└──────────────────────┬────────────────────────┘
                       │  HTTP (JSON, JWT)
                       ▼
┌─────────────────────────────────────────────┐
│               Express REST API                │
│  routes → controllers → services → repos      │
│              → Mongoose models                │
└──────────────────────┬────────────────────────┘
                       ▼
                  MongoDB (Atlas)
```

**Frontend data flow:** components call domain **hooks** (React Query) → hooks call **services** → services use the shared **axios client** (auto-attaches the JWT, normalizes errors, auto-logout on 401).

**Backend layers:** **routes** → **controllers** → **services** (business logic) → **repositories** (data access) → **Mongoose models**.

---

## 🔁 Standard Response Format

**Success**

```json
{
  "status": "success",
  "data": {}
}
```

**Error**

```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## 📄 License

MIT License — see [LICENSE](backend/LICENSE).
