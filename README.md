# CampusLibrary AI

CampusLibrary AI is a modern, production-grade **Multi-Tenant Library Management SaaS** platform engineered with React (Vite + TypeScript) on the frontend and Node.js (Express + MongoDB) on the backend. It integrates **Google Gemini AI (gemini-2.5-flash)** to offer assistant chat systems, semantic catalog searches, borrow frequency forecasting, and metadata optimization.

---

## Key Features

- **Multi-Tenant SaaS Architecture:** Tenant scoping enforces logical data separation. All books, student rosters, circulation logs, and support queries are scoped by `collegeId`.
- **Gemini 2.5 Flash AI Engine:** Exposes modular endpoints (`POST /api/ai/chat`, `GET /api/ai/recommend-books`, `POST /api/ai/check-duplicates`, `GET /api/ai/predict-demand`, `POST /api/ai/smart-search`) with fallback heuristics.
- **SaaS Billing & Invoicing:** Admin console featuring billing progression bars, dynamic package upgrade/downgrade controls (Starter, Standard, Professional), custom Enterprise sales contact forms, invoice history data grids, and a printable Invoice UI modal.
- **Bulk Imports & Exporters:** Upload student rosters directly in CSV format, enforce plan quotas (500 capacity for Standard Tier), generate passwords automatically, validate email formats, and export results.
- **Dynamic Configuration Hub:** Dynamic management controls for adding/deleting departments and academic year collections which immediately bind to dropdown search options.
- **Audit Logs Trail:** Records system catalog edits, billing changes, circulation transactions, and admin operations. Features printable PDF audit summaries and Excel CSV logging.
- **Simulated Barcode Scanner:** Interactive barcode camera scanner simulation with viewport guides and green laser scanning animation overlay.
- **QR Codes Asset Tagging:** Beautiful SVG-generated asset QR codes inside the catalog drawers.
- **Session Cookie Rotation:** Rotates short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d) using secure, `httpOnly`, SameSite=Strict cookies.

---

## Production Security Measures

- **Rate Limiting:** Protects endpoints from DDoS and brute force requests (limiting IPs to 150 requests per 15-minute window).
- **Helmet Security Headers:** Employs standard headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`).
- **CSRF Guards:** Validates request origins and referrer headers on state-changing operations (POST, PUT, DELETE) to protect against cross-site request forgery.
- **Input Sanitization:** Strips raw HTML script tags and `javascript:` descriptors from incoming payloads to prevent XSS.
- **Error Boundaries:** Centrally catches Operational Errors (`AppError.js` + `errorHandler.js`) and hides stack details in production.

---

## Project Structure

```
├── backups/               # Timestamped database JSON backups
├── server/
│   ├── config/            # Database connections and seed parameters
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # Security, Auth, Logging, Tenant checks
│   ├── models/            # Mongoose Schemas (College, User, Book, Circulation)
│   ├── routes/            # REST API Routes
│   ├── services/          # Google Gemini AI services
│   ├── utils/             # Loggers and error builders
│   └── index.js           # Express API Entrypoint
└── src/                   # React Frontend Client (Vite + TSX)
```

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Community Server (Running on localhost port `27017`)
- Google Gemini API Key (Optional; fallback mocks will activate if absent)

### 1. Installation
Install project dependencies for both packages:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campuslibrary
JWT_ACCESS_SECRET=your_jwt_access_secret_key_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_32_characters_long
GEMINI_API_KEY=your_gemini_api_key_goes_here
```

### 3. Execution
Start the backend server:
```bash
npm run server
```

In a separate terminal, start the React client:
```bash
npm run dev
```

The frontend will open on [http://localhost:3000](http://localhost:3000).

---

## Seed Roster Credentials

Upon initial database connection, default tenants and administrative records are automatically seeded:

- **Super Admin Credentials:**
  - Email: `superadmin@campuslibrary.com`
  - Password: `superadminpassword`
- **Green Valley College (Standard Tier - Code: GVC):**
  - Admin: `admin@greenvalley.edu` / `adminpassword`
  - Student: `student1` / `password` (PRN: `GVC001`)
- **Omkar Institute of Tech (Starter Tier - Code: OIT):**
  - Admin: `admin@omkar.edu` / `adminpassword`

---

## Backup Management

Take a snapshot copy of all active collections directly to the `backups/` directory by running:
```bash
npm run db:backup
```

---

## Deployment Guide

### Backend Deployment (Render / Railway / Heroku)
1. Commit the workspace codebase to a private GitHub repository.
2. Link the repository to your host provider (e.g. Render Web Service).
3. Set the **Build Command** to `npm install` and **Start Command** to `npm run server`.
4. Configure all environment secrets (e.g. `MONGODB_URI` matching MongoDB Atlas, `JWT_ACCESS_SECRET`, `GEMINI_API_KEY`).

### Frontend Deployment (Vercel / Netlify)
1. Add a Vercel Web Project linking to your GitHub repository.
2. Configure **Framework Preset** to `Vite`.
3. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Configure environment routing proxies if required.

---

## Testing & Quality Assurance

- **TypeScript compilation check:** Confirm zero linting warnings by running:
  ```bash
  npm run lint
  ```
- **Manual Penetration Testing:**
  - Attempting to send `POST` requests from cross-origin terminals triggers the `csrfProtection` check, resulting in `403 Forbidden`.
  - Violating quota capacity limits checks (>500) blocks new bulk student imports with alerts.
  - Attempting to execute chat assistants without a valid token gets intercepted by the `authenticate` middleware, returning `401 Unauthorized`.
