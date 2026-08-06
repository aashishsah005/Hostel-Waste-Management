# Smart Hostel Food Waste Prediction & Management System

A full MERN-stack implementation of your minor project: MongoDB, Express, React, Node.js.

Live features: JWT auth with 4 roles (Admin, Mess Manager, Student, Visitor), weekly menu management,
meal booking, daily food-entry logging, a demand-prediction endpoint, waste analytics with root-cause
tagging, cost & carbon estimates, and a feedback system with a lightweight keyword summary.

## 1. Project structure

```
hostel-mess-system/
├── backend/     Express + MongoDB API
└── frontend/    React + Tailwind app (Vite)
```

## 2. Prerequisites

- Node.js 18+
- A MongoDB connection string — easiest is a free cluster at https://www.mongodb.com/cloud/atlas
  (local `mongod` also works if you have it installed)

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and paste your MongoDB URI into `MONGO_URI`, and set a random `JWT_SECRET`.

Seed the database with demo users, a weekly menu, and 30 days of realistic history:

```bash
npm run seed
```

This prints demo login credentials, e.g.:

```
Admin        -> admin@hostel.edu / admin123
Mess Manager -> manager@hostel.edu / manager123
Student      -> student1@hostel.edu / student123
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000` (health check: `GET /api/health`).

## 4. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` to the backend, and `VITE_API_URL`
in `.env` controls the base URL used by the React app directly.

## 5. What to log in as

- **Admin** — user management, 30-day analytics overview (waste, cost, carbon, feedback).
- **Mess Manager** — daily food-entry form, demand prediction panel, waste trend & root-cause
  charts, menu editor, feedback keyword summary.
- **Student / Visitor** — weekly menu, meal booking, booking history, meal feedback.

## 6. About the "AI" prediction

Your original proposal specified Scikit-learn for the ML model. Since this build is MERN
end-to-end, `backend/utils/predictDemand.js` implements demand forecasting as a weighted moving
average over recent food-entry history, blended with the day's live bookings. It's a genuine,
data-driven prediction — just not a trained scikit-learn model.

If your evaluators expect an actual scikit-learn regression model (Linear Regression / Random
Forest, per your original document), the clean way to add it without restructuring the app is:

1. Build a small FastAPI service that trains on the same `FoodEntry` data (exported via the API
   or a CSV dump) and exposes `POST /predict`.
2. Replace the body of `predictFromHistory` with an `axios.post()` call to that service.

Everything else — the routes, the dashboard, the charts — stays the same either way.

## 7. Design notes

Palette and type are defined as design tokens in `frontend/tailwind.config.js`:
forest green (`forest`) as the primary brand color, turmeric (`turmeric`) as the food-warmth
accent, and clay (`clay`) reserved specifically for waste/alert numbers. Display type is
**Fraunces**, body is **Manrope**, data figures use **IBM Plex Mono**. The circular "plate gauge"
(`PlateGauge.jsx`) is the signature visual — a thali-style ring showing meals saved vs. wasted —
used on the landing hero and both the admin and mess-manager dashboards.

## 8. Deployment (matches your original plan)

- Frontend → Vercel (`npm run build` produces `frontend/dist`)
- Backend + MongoDB → Railway or Render, with `MONGO_URI` pointed at Atlas

## 9. Not yet built (documented future scope)

Per your proposal's future-scope list: live mess population/waiting time, visitor QR entry with
payment, smart inventory purchase prediction, and the AI menu optimizer. The schema (`User`,
`Booking`, `FoodEntry`, `MenuItem`, `Feedback`) is designed so these can be added as new
routes/collections without changing what's already built.
