# 🍽️ Smart Hostel Food Waste Prediction & Management System

> An end-to-end, full-stack hostel mess management platform that combines **real-time student meal expectations, 1-click skip controls, multi-day vacation pauses, visitor QR passes, machine learning demand forecasting, daily meal closing audits, and administrative governance** to minimize hostel food waste and optimize kitchen preparation.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
   - [Student Features](#-student-features)
   - [Mess Manager Features](#-mess-manager-features)
   - [Admin Control Center](#-admin-control-center)
3. [System Architecture](#-system-architecture)
4. [Technology Stack](#-technology-stack)
5. [Database Schemas & Models](#-database-schemas--models)
6. [User Roles & Authorization Matrix](#-user-roles--authorization-matrix)
7. [API Endpoint Reference](#-api-endpoint-reference)
8. [Core Systems & Workflow Details](#-core-systems--workflow-details)
   - [Meal Skip & Cutoff Engine](#1-meal-skip--cutoff-engine)
   - [Multi-Day Vacation Pause](#2-multi-day-vacation-pause)
   - [Smart Notification System](#3-smart-notification-system)
   - [Visitor Booking & QR Pass System](#4-visitor-booking--qr-pass-system)
   - [AI Demand Prediction Engine](#5-ai-demand-prediction-engine)
   - [Kitchen Preparation Decision Rule](#6-kitchen-preparation-decision-rule)
   - [Daily Kitchen Closing & Performance Audit](#7-daily-kitchen-closing--performance-audit)
9. [Security Implementation](#-security-implementation)
10. [Timezone & Date Management (IST)](#-timezone--date-management-ist)
11. [Repository Directory Structure](#-repository-directory-structure)
12. [Installation & Local Setup](#-installation--local-setup)
13. [Environment Variables](#-environment-variables)
14. [Current Implementation Status](#-current-implementation-status)
15. [Limitations & Future Scope](#-limitations--future-scope)
16. [Copyright](#-copyright)

---

## 🌟 Project Overview

### The Problem
Hostel messes face significant daily food waste due to unpredictable student attendance. Traditional systems prepare fixed quantities of food based solely on total enrolled students, resulting in:
* Large quantities of unconsumed food thrown away daily.
* Significant financial losses for hostel management.
* Environmental degradation from organic waste decomposition (methane emissions).
* Occasional food shortages when unexpected guest rushes occur.

### The Solution
The **Smart Hostel Food Waste Prediction & Management System** solves this mismatch by bridging the gap between student intent, visitor demand, and kitchen preparation through:
1. **Automatic Student Meal Expectation**: Students are assumed present by default unless explicitly skipped or paused via Vacation Mode.
2. **Strict Cutoff Enforcement**: Enforces cutoff times (3 hours prior to meal start) for skipping meals so chefs know exact diner counts before cooking begins.
3. **AI Machine Learning Demand Forecasting**: Analyzes 30-day historical consumption trends using a weighted moving average with safety buffers.
4. **Authoritative Kitchen Control Room**: Combines live student demand + paid visitor passes with AI forecasts to compute an optimal **Final Preparation Target**.
5. **Daily Meal Audits**: Allows managers to log actual cooked, consumed, and wasted food to measure Target Execution Accuracy (%) and AI Forecast Accuracy (%).

---

## ✨ Key Features

### 👨‍🎓 Student Features
* **1-Click Quick Demo Login**: Single-click quick authentication buttons for rapid testing.
* **Automatic Meal Expectation**: Students are automatically expected for Breakfast, Lunch, Snacks, and Dinner without manual daily booking.
* **Meal Skip Control**: 1-click meal skip and undo-skip buttons enforced by IST cutoff timers:
  * **Breakfast**: Cutoff at 4:00 AM IST (Meal 7:00 AM – 8:00 AM)
  * **Lunch**: Cutoff at 8:00 AM IST (Meal 11:00 AM – 1:00 PM)
  * **Snacks**: Cutoff at 1:00 PM IST (Meal 4:00 PM – 5:00 PM)
  * **Dinner**: Cutoff at 4:00 PM IST (Meal 7:00 PM – 8:00 PM)
* **Smart Notification System**:
  * **Breakfast Reminder**: Sent at 9:00 PM IST on the previous evening.
  * **Other Meal Reminders**: Sent 4 hours prior to meal start.
  * **Auto-Suppression**: Skipped meals or vacation days automatically suppress reminder alerts.
* **Vacation / Multi-Day Meal Pause**: Select start date, end date, and specific meal slots to pause all meals during holidays or home visits (up to 60 days). Supports vacation cancellation and smart resumption of future unclosed meals.
* **Visitor Pass & Demo Payment**: Purchase visitor meal passes for guests with simulated payment gateway checkout, generating unique transaction IDs (`TXN-DEMO-YYYYMMDD-XXXXXX`) and scannable QR tokens (`VIS-XXXXXX`).
* **Weekly Mess Menu**: View daily 7-day recipes and visitor pricing.
* **Student Feedback**: Rate meal taste, cleanliness, and service speed with custom comments.

### 👨‍🍳 Mess Manager Features
* **Smart Kitchen Control Room**: Real-time kitchen dashboard featuring a 4-meal planning grid for Breakfast, Lunch, Snacks, and Dinner.
* **Live Demand Calculation**: Computes live diners:
  $$\text{Expected Student Diners} = \text{Total Active Students} - \text{Student Skips}$$
  $$\text{Final Live Kitchen Demand} = \text{Expected Student Diners} + \text{Paid Visitor Passes}$$
* **AI Demand Context**: Displays ML forecasted consumption and recommended preparation count alongside live demand.
* **Final Preparation Target Decision**: Prominently highlights optimal cooking target:
  $$\text{Final Preparation Target} = \max(\text{Live Kitchen Demand}, \text{AI Recommended Preparation})$$
* **Preparation Risk Badges**:
  * 🟢 **Balanced Demand**: Live demand aligns nicely with AI recommendation.
  * 🟡 **Slight Over-prep Risk**: AI recommendation exceeds live demand.
  * 🔴 **Under-prep Risk**: Live demand exceeds AI recommendation.
* **Daily Kitchen Closing Audit**: Modal form to log actual prepared food, consumed food, and waste kg. Automatically calculates:
  * **Preparation Variance** ($\text{Meals Prepared} - \text{Target}$)
  * **Target Execution Accuracy %**
  * **AI Forecast Accuracy %**
* **Waste & Sentiment Analytics**: Tracks 30-day waste kg trends, financial cost lost ($\text{kg} \times \text{₹60}$), carbon impact ($\text{kg} \times 2.5\text{ kg CO}_2\text{e}$), and top feedback keywords.
* **Weekly Menu Management**: Add, update, or remove daily menu recipes and visitor prices.

### 🛡️ Admin Control Center
* **System Overview Bar**: Real-time stats for Total Students, Active vs Disabled Students, Active Mess Managers, Today's Skips, Active Vacations, Today's Visitor Passes, and Visitor Revenue.
* **Student Directory Management**: Search students by name, email, or room number; filter by status (Active / Disabled); toggle account status; delete user accounts.
* **Mess Manager Account Management**: Create new staff/manager accounts; toggle manager active status (deactivated managers automatically stop receiving system alerts).
* **Vacation Monitoring Tab**: View active student vacations, start/end dates, hostel block, room number, and total meals paused.
* **Visitor Pass & Financial Audit Tab**: Financial audit log of all paid visitor passes, transaction IDs (`TXN-DEMO-YYYYMMDD-XXXXXX`), token codes, payment amounts, and dates.
* **Role-Based Authorization**: Restricts `/api/users/*` endpoints strictly to users with `role: 'admin'`. Non-admin access attempts return `403 Forbidden`.

---

## 🏗️ System Architecture

```
                                  USER INTERFACE
         (React 18 + Vite + TailwindCSS + Recharts + React Router DOM)
                                       │
                                       ▼ HTTP REST APIs (Axios)
                               BACKEND CONTROLLERS
                     (Express.js + Node.js + JWT Auth)
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
   AUTH & USER CONTROL        MEAL & BOOKING ENGINE      KITCHEN & AI INTELLIGENCE
  (User, Auth Middleware)  (Booking, Vacation, Cutoff) (FoodEntry, predictDemand.js)
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                              MONGODB DATABASE
             (Mongoose ODM Schemas + Compound Unique Indexes)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Vite 5) | Single-page client architecture with modular components |
| **Styling & Design** | TailwindCSS 3 | Food-themed visual design (Cream, Forest Green, Turmeric, Sage) |
| **Typography** | Plus Jakarta Sans & Fraunces | Modern serif headings & clean sans-serif body typography |
| **Data Visualization** | Recharts 2 | Line charts, bar charts, and pie charts for waste & feedback analytics |
| **HTTP Client** | Axios 1.7 | Promised-based API communication with token interceptors |
| **Backend Runtime** | Node.js (v18+) | Asynchronous server-side execution environment |
| **Web Framework** | Express.js 4 | REST API routing, controller logic, and security middleware |
| **Database** | MongoDB Atlas / Local | NoSQL document database storing application state |
| **Object Modeling** | Mongoose 8 | Schema validation, compound unique indexing, and population |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs | Signed authorization tokens and salt-hashed passwords |
| **Build Tooling** | Vite 5 & Rollup | Production bundle optimization (`manualChunks` vendor splitting) |

---

## 🗄️ Database Schemas & Models

### 1. User (`models/User.js`)
* **Fields**: `name`, `email` (unique), `password` (hashed), `role` (`student`, `mess_manager`, `admin`, `visitor`), `hostelBlock`, `roomNumber`, `phone`, `isActive` (boolean, default `true`).
* **Purpose**: Stores student credentials, hostel room allocation, and staff account roles.

### 2. Booking (`models/Booking.js`)
* **Fields**: `student` (ref `User`), `date` (Date), `mealType` (`Breakfast`, `Lunch`, `Snacks`, `Dinner`), `status` (`booked`, `skipped`, `consumed`, `cancelled`), `skipSource` (`manual`, `vacation`), `isVisitorPass` (boolean), `paymentStatus` (`unpaid`, `paid`, `failed`, `refunded`), `paymentAmount` (Number), `paymentMethod` (`card`, `upi`, `netbanking`, `dummy`), `transactionId` (String, sparse unique), `paidAt` (Date), `tokenCode` (String).
* **Indexes**: 
  * `{ student: 1, date: 1, mealType: 1 }` (**Unique Index** — Prevents duplicate meal bookings)
  * `{ transactionId: 1 }` (**Sparse Unique Index** — Guarantees unique payment transaction IDs)

### 3. Vacation (`models/Vacation.js`)
* **Fields**: `student` (ref `User`), `startDate` (Date), `endDate` (Date), `mealTypes` (Array of Strings), `totalMealsSkipped` (Number), `status` (`active`, `cancelled`).
* **Index**: `{ student: 1, status: 1 }`

### 4. Notification (`models/Notification.js`)
* **Fields**: `user` (ref `User`), `title` (String), `message` (String), `type` (`meal_reminder`, `skip_confirmed`, `vacation_alert`, `manager_skip_alert`, `manager_vacation_alert`, `manager_payment_alert`, `system`), `date` (Date), `mealType` (String), `isRead` (boolean, default `false`), `senderStudent` (ref `User`).
* **Index**: `{ user: 1, date: 1, mealType: 1, type: 1, senderStudent: 1 }` (**Unique Index** — Prevents duplicate notification spam)

### 5. FoodEntry (`models/FoodEntry.js`)
* **Fields**: `date` (Date), `mealType` (`Breakfast`, `Lunch`, `Snacks`, `Dinner`), `mealsBooked` (Number), `mealsPrepared` (Number), `mealsConsumed` (Number), `foodWastedKg` (Number), `wasteReason` (String), `targetPreparation` (Number, optional), `expectedDiners` (Number, optional), `aiRecommendedPrep` (Number, optional), `recordedBy` (ref `User`), `notes` (String).
* **Index**: `{ date: 1, mealType: 1 }` (**Unique Index**)

### 6. MenuItem (`models/MenuItem.js`)
* **Fields**: `dayOfWeek` (`Monday`–`Sunday`), `mealType` (`Breakfast`, `Lunch`, `Snacks`, `Dinner`), `items` (Array of Strings), `price` (Number), `isActive` (boolean, default `true`).
* **Index**: `{ dayOfWeek: 1, mealType: 1 }` (**Unique Index**)

### 7. Feedback (`models/Feedback.js`)
* **Fields**: `user` (ref `User`), `mealType` (String), `tasteRating` (Number 1–5), `cleanlinessRating` (Number 1–5), `serviceRating` (Number 1–5), `comment` (String).

---

## 🔐 User Roles & Authorization Matrix

| User Role | Dashboard Route | Permitted Capabilities |
| :--- | :--- | :--- |
| **`student`** | `/student` | View expected meals, skip/unskip before cutoff, set vacation mode, buy visitor passes, submit meal feedback |
| **`mess_manager`** | `/mess` | View Kitchen Control Room, inspect live vs AI demand, log daily closing audits, manage weekly menu recipes |
| **`admin`** | `/admin` | Full system overview, manage student accounts, create/delete manager staff, monitor vacations & visitor payments |
| **`visitor`** | `/student` | Purchase guest meal passes, complete simulated payment checkout, view QR passes |

---

## 📡 API Endpoint Reference

### Authentication Routes (`/api/auth`)
* `POST /api/auth/register` — Register a new student account
* `POST /api/auth/login` — Authenticate user credentials and return JWT token
* `GET /api/auth/me` — Return currently authenticated user profile (`protect`)

### Meal & Booking Routes (`/api/bookings`)
* `GET /api/bookings/mine` — Retrieve authenticated student's booking & skip history (`protect`)
* `GET /api/bookings/counts` — Retrieve authoritative diner counts, skips, visitor passes & revenue (`protect`)
* `POST /api/bookings/skip` — Skip a single meal slot before cutoff (`protect`)
* `PATCH /api/bookings/unskip` — Undo skip before cutoff (`protect`)
* `POST /api/bookings/visitor-pay` — Process dummy visitor pass payment and generate QR token (`protect`)

### Vacation Routes (`/api/vacations`)
* `GET /api/vacations/mine` — Get student's vacation history (`protect`)
* `POST /api/vacations` — Create a multi-day vacation pause (`protect`)
* `PATCH /api/vacations/:id/cancel` — Cancel active vacation and resume future un-closed meals (`protect`)

### Notification Routes (`/api/notifications`)
* `GET /api/notifications` — Get unread and recent notifications for authenticated user (`protect`)
* `PATCH /api/notifications/:id/read` — Mark notification as read (`protect`)

### Kitchen & Food Entry Routes (`/api/food-entries`)
* `GET /api/food-entries/predict` — Fetch ML demand forecast for a meal slot (`protect`)
* `POST /api/food-entries` — Submit daily meal closing audit (`protect`, `authorize('mess_manager', 'admin')`)

### Analytics Routes (`/api/analytics`)
* `GET /api/analytics/waste` — 30-day waste kg, cost lost, carbon impact & root cause breakdown (`protect`)
* `GET /api/analytics/performance` — Daily kitchen performance audit table with execution accuracy (`protect`)
* `GET /api/analytics/feedback` — Aggregated student ratings & keyword sentiment analysis (`protect`)

### User & Admin Management Routes (`/api/users`)
* `GET /api/users` — List users by role (`protect`, `authorize('admin')`)
* `GET /api/users/admin-overview` — System summary stats (`protect`, `authorize('admin')`)
* `GET /api/users/admin-vacations` — Active and past student vacations (`protect`, `authorize('admin')`)
* `GET /api/users/admin-visitor-payments` — Paid visitor pass audit log (`protect`, `authorize('admin')`)
* `POST /api/users/staff` — Create staff account (`protect`, `authorize('admin')`)
* `PATCH /api/users/:id/status` — Toggle user active/disabled status (`protect`, `authorize('admin')`)
* `DELETE /api/users/:id` — Delete user account (`protect`, `authorize('admin')`)

---

## ⚙️ Core Systems & Workflow Details

### 1. Meal Skip & Cutoff Engine
* Students are automatically assumed present for every meal slot.
* When a student clicks **Skip**, the backend validates whether the current time is before the meal's cutoff timestamp (`utils/mealCutoff.js`).
* If before cutoff, a `Booking` record with `status: 'skipped'` is created/updated.
* If cutoff has passed, the server rejects the skip request with a `400 Bad Request` (`Cutoff time passed`).

### 2. Multi-Day Vacation Pause
* Students specify a `startDate`, `endDate`, and selected meal types (`Breakfast`, `Lunch`, `Snacks`, `Dinner`).
* The controller computes each calendar day in the range and executes a MongoDB `bulkWrite` with `updateOne` and `upsert: true`.
* Skipped booking records are created with `skipSource: 'vacation'`.
* Cancelling a vacation searches for future un-closed meal slots and updates them back to `status: 'booked'`, leaving past closed meals untouched for historical reporting accuracy.

### 3. Smart Notification System
* **Automated Generation**: Reminders are generated dynamically when students fetch notifications.
* **Breakfast Logic**: Evaluates at 9:00 PM IST on day $T-1$ for day $T$'s Breakfast.
* **Other Meals**: Evaluates 4 hours before meal start on the meal day.
* **Auto-Suppression**: Checks if a booking with `status: 'skipped'` or an active vacation exists; if found, reminder creation is bypassed.

### 4. Visitor Booking & QR Pass System
* Anyone (Student, Staff, or Visitor) can purchase visitor passes.
* **Authoritative Pricing**: Server fetches price from `MenuItem.findOne({ dayOfWeek, mealType, isActive: true })` (e.g., ₹40 for Lunch/Dinner, ₹20 for Snacks). Client-side price tampering is impossible.
* **Transaction ID Generator**: Generates `TXN-DEMO-YYYYMMDD-XXXXXX` using server crypto.
* **QR Token Generator**: Generates `VIS-XXXXXX` token and creates a `Booking` record with `isVisitorPass: true` and `paymentStatus: 'paid'`.
* **Manager Notification**: Emits a real-time notification to active Mess Managers informing them of new visitor diner additions.

### 5. AI Demand Prediction Engine (`utils/predictDemand.js`)
* **Methodology**: Weighted 30-day moving average. Recent days carry higher mathematical weights (e.g., last 7 days weighted at 0.50, days 8–14 at 0.30, days 15–30 at 0.20).
* **Safety Buffer**: Adds a 5% safety margin to prevent accidental food under-preparation.
* **Output**: Returns `predictedConsumption`, `recommendedPreparation`, `predictedWasteKg`, `confidence`, `method`, and `sampleSize`.

### 6. Kitchen Preparation Decision Rule
To eliminate food shortages while minimizing waste, the Smart Kitchen Control Room applies the transparent decision rule:
$$\text{Final Preparation Target} = \max(\text{Live Kitchen Demand}, \text{AI Recommended Preparation})$$
This guarantees that if live student bookings + visitor passes exceed the historical AI forecast, the kitchen prepares enough food for every live diner. Conversely, if live demand is low but historical AI trends predict a late rush, the AI recommendation protects against under-preparation.

### 7. Daily Kitchen Closing & Performance Audit
After a meal completes, the Mess Manager clicks `📝 Close & Audit Meal` on the kitchen grid. The system pre-fills `expectedDiners`, `targetPreparation`, and `aiRecommendedPrep` into the audit form. The manager enters actual `mealsPrepared`, `mealsConsumed`, and `foodWastedKg`.
* **Formulas Calculated**:
  $$\text{Preparation Variance} = \text{mealsPrepared} - \text{targetPreparation}$$
  $$\text{Target Execution Accuracy \%} = \max\left(0, 100 - \frac{|\text{mealsPrepared} - \text{targetPreparation}|}{\max(1, \text{targetPreparation})} \times 100\right)$$
  $$\text{AI Forecast Accuracy \%} = \max\left(0, 100 - \frac{|\text{aiRecommendedPrep} - \text{mealsConsumed}|}{\max(1, \text{mealsConsumed})} \times 100\right)$$
  $$\text{Financial Cost Lost (₹)} = \text{foodWastedKg} \times 60$$
  $$\text{Carbon Footprint (kg CO}_2\text{e)} = \text{foodWastedKg} \times 2.5$$

---

## 🔒 Security Implementation

* **Salt-Hashed Passwords**: Password fields are encrypted via `bcryptjs` with 10 salt rounds before database persistence.
* **Stateless JWT Tokens**: Signed JSON Web Tokens with 7-day expiration transmitted via `Authorization: Bearer <token>` HTTP headers.
* **Strict Role-Based Authorization**: `authorize('admin')` middleware blocks non-admin users with `403 Forbidden`.
* **IDOR Protection**: Ownership is verified server-side using `req.user._id` for all student booking, vacation, and notification operations.
* **Database Unique Constraints**: Unique indexes on `{ student: 1, date: 1, mealType: 1 }` and sparse unique index on `{ transactionId: 1 }` prevent race conditions and duplicate transaction injections.

---

## 🕒 Timezone & Date Management (IST)

The system operates strictly on **Indian Standard Time (IST, UTC+5:30)** regardless of the server's host location:
* **Date Normalization**: Calendar days are converted to exact IST UTC boundaries:
  ```javascript
  const startMs = Date.UTC(year, month - 1, day, 0, 0, 0) - (5.5 * 3600 * 1000);
  const endMs = startMs + (24 * 3600 * 1000) - 1;
  ```
* This guarantees that meal bookings, skip cutoffs, visitor passes, and daily audits align accurately to the local hostel calendar day.

---

## 📁 Repository Directory Structure

```
Hostel-Waste-Management/
├── package.json                   # Root package configuration (concurrently scripts)
├── README.md                      # Complete project documentation
├── backend/
│   ├── .env                       # Environment configuration
│   ├── .env.example               # Template environment variables
│   ├── package.json               # Backend dependencies (Express, Mongoose, JWT, bcryptjs)
│   ├── server.js                  # Express application entry point & DB connection
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection client
│   ├── controllers/
│   │   ├── analyticsController.js # Waste, kitchen performance & feedback analytics
│   │   ├── authController.js      # Login, registration & user verification
│   │   ├── bookingController.js   # Meal skips, unskips, diner counts & visitor payments
│   │   ├── feedbackController.js  # Student feedback submission
│   │   ├── foodEntryController.js# Daily meal closing audit logs
│   │   ├── menuController.js      # Weekly mess recipe & price management
│   │   ├── notificationController.js # Smart notification generation & read state
│   │   ├── userController.js      # User management & Admin Control Center metrics
│   │   └── vacationController.js  # Multi-day vacation pause & cancellation
│   ├── middleware/
│   │   └── auth.js                # JWT verification & role authorization middleware
│   ├── models/
│   │   ├── Booking.js             # Meal booking, skip & visitor payment schema
│   │   ├── Feedback.js            # Rating & comment schema
│   │   ├── FoodEntry.js           # Daily meal closing & preparation audit schema
│   │   ├── MenuItem.js            # Weekly recipe schedule & pricing schema
│   │   ├── Notification.js        # Notification message & recipient schema
│   │   ├── User.js                # User profile & credentials schema
│   │   └── Vacation.js            # Multi-day leave pause schema
│   ├── routes/                    # Express REST route definitions
│   ├── seed/
│   │   └── seed.js                # Database seeder script for demo data
│   └── utils/
│       ├── mealCutoff.js          # IST meal timing & cutoff calculation engine
│       ├── notifyManagers.js      # Helper for dispatching manager alert notifications
│       └── predictDemand.js       # ML weighted moving-average demand forecast engine
└── frontend/
    ├── package.json               # Frontend dependencies (React, Vite, Recharts, Axios)
    ├── vite.config.js             # Vite configuration with Rollup manualChunks optimization
    ├── index.html                 # HTML entry point with Plus Jakarta Sans Google Fonts
    └── src/
        ├── App.jsx                # React Router DOM page routing & protected routes
        ├── index.css              # Global TailwindCSS styles & font family setup
        ├── main.jsx               # React DOM root renderer
        ├── api/
        │   └── axios.js           # Axios HTTP instance with JWT authorization interceptors
        ├── components/
        │   ├── Loader.jsx         # Accessible loading spinner component
        │   ├── Navbar.jsx         # Main navigation bar with notification bell & role links
        │   ├── PlateGauge.jsx     # SVG radial gauge component for meal fulfilment %
        │   ├── ProtectedRoute.jsx # Role-based route guard wrapper
        │   └── StatCard.jsx       # Metric summary card component
        ├── context/
        │   └── AuthContext.jsx    # React Context managing user authentication state
        └── pages/
            ├── Landing.jsx        # Public landing page with features & impact stats
            ├── Login.jsx          # Login page with 1-Click Quick Demo Login buttons
            ├── Register.jsx       # Student account registration page
            ├── admin/
            │   └── AdminDashboard.jsx # Admin Control Center (6 management tabs)
            ├── mess/
            │   └── MessDashboard.jsx  # Smart Kitchen Control Room & daily audit tabs
            └── student/
                └── StudentDashboard.jsx # Student Portal (Meals, Skip, Vacation, Visitor Pass)
```

---

## 💻 Installation & Local Setup

### Prerequisites
* **Node.js**: `v18.0.0` or higher installed.
* **npm**: `v9.0.0` or higher installed.
* **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI.

### Step 1: Clone Repository
```bash
git clone https://github.com/aashishsah005/Hostel-Waste-Management.git
cd Hostel-Waste-Management
```

### Step 2: Install All Dependencies
```bash
npm run install:all
```
*This command automatically installs dependencies for root, `backend/`, and `frontend/`.*

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_user:your_password@cluster0.mongodb.net/hostel_mess
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 4: Seed Initial Demo Data (Optional)
```bash
npm run seed
```
*Populates sample students, mess managers, admin accounts, weekly menus, and historical food entries.*

### Step 5: Start Development Servers
```bash
npm run dev
```
*Launches backend Express server (`http://localhost:5000`) and Vite frontend dev server (`http://localhost:5173`) concurrently.*

### Step 6: Build for Production
```bash
npm run build --prefix frontend
```
*Generates optimized production bundle in `frontend/dist/` with zero Rollup warnings.*

---

## 🔑 Environment Variables Reference

| Variable Name | Required | Example Value | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Backend Express server port |
| `MONGO_URI` | Yes | `mongodb+srv://...` | MongoDB connection string |
| `JWT_SECRET` | Yes | `your_secret_key` | Secret key for signing JWT authorization tokens |
| `JWT_EXPIRES_IN` | Yes | `7d` | Lifetime of signed JWT tokens |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin for frontend client requests |

---

## 🔄 End-to-End Workflow Diagram

```
[STUDENT PORTAL]                      [KITCHEN CONTROL ROOM]                      [ADMIN CENTER]
      │                                         │                                      │
  Views Today's                              Live Demand                               Overview
  Expected Meals                           Calculated Dynamically                      Dashboard
      │                                         │                                      │
  Clicks "Skip Meal" ───────────────► expectedDiners = TotalActive - Skips            Monitors Skips,
  (Before Cutoff)                               │                                     Vacations &
      │                                         ▼                                     Visitor Revenue
  Booking Status                       AI Demand Forecast                              │
  Updated to 'skipped'               (Weighted 30d Moving Avg)                        Manages Student
      │                                         │                                     & Manager Accounts
      ▼                                         ▼                                      │
  Notification Suppressed           ⭐ FINAL PREPARE TARGET =                         Audits Visitor Pass
  & Manager Alerted                  MAX(Live Demand, AI Forecast)                    Transactions
                                                │                                      │
                                                ▼                                      ▼
                                        Cooks Target Meals                     Tracks System Health
                                                │                                      │
                                                ▼                                      ▼
                                       Daily Closing Audit                    Full Operational
                                    (Logs Waste, Cost & CO₂e)                  Control & Governance
```

---

## 🚀 Current Implementation Status

* ✅ **Student Portal**: Automatic expectations, 1-click skips, IST cutoff enforcement, multi-day vacation mode, visitor dummy checkout, QR pass generator.
* ✅ **Mess Manager Portal**: Smart Kitchen Control Room, 4-meal planning grid, preparation risk indicators, decision rationale, daily closing audit, waste & feedback analytics.
* ✅ **Admin Control Center**: System metrics bar, student management with search/filter, manager account creation/deactivation, vacation monitoring, visitor payment audit log.
* ✅ **Security & Integrity**: JWT authentication, bcrypt hashing, RBAC middleware (`403 Forbidden` checks), IDOR protection, unique database compound indexes.
* ✅ **Build & Bundle Optimization**: 0 Rollup chunk size warnings, Vite manual vendor splitting.

---

## 🔮 Limitations & Future Scope

### Current Limitations
1. **Simulated Payment Gateway**: Visitor checkout simulates payments via backend cryptographic transaction IDs (`TXN-DEMO-*`) rather than integrating live Razorpay/Stripe APIs.
2. **Notification Transport**: Notifications are delivered via HTTP polling (60s interval) rather than WebSockets (Socket.io) or Web Push Notifications.
3. **QR Token Verification**: Visitor QR passes are generated and rendered on-screen as scannable images, but gate scanner hardware integration is simulated.

### Future Scope
* **Live Payment Integration**: Integrate Razorpay / UPI intent APIs for real visitor pass payments.
* **WebSocket Real-time Feed**: Implement Socket.io for instant real-time kitchen alerts without polling.
* **Hardware Gate Integration**: Connect optical QR code scanners at hostel mess turnstiles to automatically mark meals as `consumed`.
* **Advanced Neural Forecasting**: Upgrade `predictDemand.js` to utilize LSTM neural networks incorporating weather forecasts and exam calendar feeds.

---

## © Copyright

**Copyright © 2026 Rajput Anuj Singh Chauhan. All Rights Reserved.**

This project, including its source code, design, architecture, documentation, and original implementation, is proprietary work of the copyright holder.

Unauthorized copying, reproduction, modification, distribution, or commercial use of this project or substantial portions of its original implementation is not permitted without prior written permission.
