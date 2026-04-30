# KarzaDesk

A full-stack loan management platform built with the MERN stack, Next.js 14, and TypeScript. Covers the complete loan lifecycle from borrower application through collections, with role-based access control enforced on both frontend and backend.

---

## Tech Stack

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend** — Node.js, Express.js, TypeScript
- **Database** — MongoDB with Mongoose ODM
- **Auth** — JWT tokens + bcrypt password hashing
- **File Upload** — Multer (PDF/JPG/PNG, max 5MB)

---

## Prerequisites

- Node.js v18 or higher
- MongoDB (local instance or MongoDB Atlas URI)
- npm

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/PushprajPandey/KarzaDesk
cd karza-desk
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values (see Environment Variables section below), then:

```bash
npm run seed    # Creates all 6 default role accounts
npm run dev     # Starts backend on port 8080
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:8080`, then:

```bash
npm run dev     # Starts frontend on port 3000
```

### 4. Open the app

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`

---

## Environment Variables

### Backend `.env`

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/karzadesk
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Login Credentials

Run `npm run seed` inside the backend directory before using these.

| Role         | Email              | Password     | Dashboard Access         |
| ------------ | ------------------ | ------------ | ------------------------ |
| Admin        | admin@lms.com      | Admin@123    | All modules              |
| Sales        | sales@lms.com      | Sales@123    | Sales module only        |
| Sanction     | sanction@lms.com   | Sanction@123 | Sanction module only     |
| Disbursement | disburse@lms.com   | Disburse@123 | Disbursement module only |
| Collection   | collection@lms.com | Collect@123  | Collection module only   |
| Borrower     | borrower@lms.com   | Borrower@123 | Borrower portal only     |

---

## End-to-End Flow

### Borrower Journey

1. Register at `/register` or log in at `/login`
2. Fill personal details at `/personal-details` — BRE runs server-side on submission
3. Upload salary slip (PDF/JPG/PNG, max 5MB) at `/upload-slip`
4. Configure loan amount (50,000–500,000) and tenure (30–365 days) at `/loan-config` — live SI calculation updates on every slider change
5. Submit application — status visible at `/status`

### Operations Flow

1. **Sales** — View borrowers who registered but have not completed an application
2. **Sanction** — Review applied loans, approve or reject with a required reason
3. **Disbursement** — Mark sanctioned loans as disbursed (funds released)
4. **Collection** — Record payments by UTR number; loan auto-closes when total paid equals total repayment
5. **Admin** — Full visibility across all users and loans

---

## Business Rule Engine (BRE)

BRE runs exclusively on the server inside `src/services/breService.ts`. A 422 response is returned if any rule fails.

| Rule           | Condition                                 |
| -------------- | ----------------------------------------- |
| Age            | Must be between 23 and 50 years           |
| Monthly Salary | Must be at least 25,000                   |
| PAN Format     | Must match `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` |
| Employment     | Must not be unemployed                    |

---

## Loan Calculation

Simple Interest formula used throughout:

```
SI = (Principal x 12 x Tenure in days) / (365 x 100)
Total Repayment = Principal + SI
Outstanding Balance = Total Repayment - Amount Paid
```

Interest rate is fixed at 12% per annum. All values are rounded to 2 decimal places. The loan status transitions to `closed` automatically when `outstandingBalance <= 0`.

---

## Loan Status Transitions

```
INCOMPLETE → APPLIED → SANCTIONED → DISBURSED → CLOSED
                  └──→ REJECTED
```

| Transition             | Triggered by                                |
| ---------------------- | ------------------------------------------- |
| INCOMPLETE → APPLIED   | Borrower submits loan config                |
| APPLIED → SANCTIONED   | Sanction executive approves                 |
| APPLIED → REJECTED     | Sanction executive rejects with reason      |
| SANCTIONED → DISBURSED | Disbursement executive disburses            |
| DISBURSED → CLOSED     | Auto-triggered when full repayment recorded |

---

## RBAC Implementation

**Backend** — every protected route passes through `verifyToken` (JWT check) then `authorizeRoles(allowedRoles[])`. Returns 401 for missing/invalid token and 403 for role mismatch.

**Frontend** — `ProtectedRoute` component checks token and role before rendering any page. The sidebar renders only the nav items permitted for the logged-in role. Borrowers cannot access the dashboard routes; operations roles cannot access the borrower portal.

---

## API Reference

### Auth

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | /api/auth/register | Register new borrower |
| POST   | /api/auth/login    | Login, returns JWT    |

### Borrower (role: borrower)

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| PUT    | /api/borrower/personal-details   | Save details + run BRE         |
| POST   | /api/borrower/upload-salary-slip | Upload salary document         |
| POST   | /api/borrower/apply              | Submit loan configuration      |
| GET    | /api/borrower/me                 | Fetch own application and loan |

### Sales (role: sales, admin)

| Method | Endpoint         | Description                              |
| ------ | ---------------- | ---------------------------------------- |
| GET    | /api/sales/leads | Borrowers with no/incomplete application |

### Sanction (role: sanction, admin)

| Method | Endpoint                               | Description          |
| ------ | -------------------------------------- | -------------------- |
| GET    | /api/sanction/applications             | All applied loans    |
| PUT    | /api/sanction/applications/:id/approve | Approve → sanctioned |
| PUT    | /api/sanction/applications/:id/reject  | Reject with reason   |

### Disbursement (role: disbursement, admin)

| Method | Endpoint                             | Description          |
| ------ | ------------------------------------ | -------------------- |
| GET    | /api/disbursement/loans              | All sanctioned loans |
| PUT    | /api/disbursement/loans/:id/disburse | Mark as disbursed    |

### Collection (role: collection, admin)

| Method | Endpoint                           | Description                        |
| ------ | ---------------------------------- | ---------------------------------- |
| GET    | /api/collection/loans              | All disbursed loans                |
| POST   | /api/collection/loans/:id/payments | Record payment (UTR, amount, date) |
| GET    | /api/collection/loans/:id/payments | Payment history for a loan         |

### Admin (role: admin)

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | /api/admin/users | All users                   |
| GET    | /api/admin/loans | All loans with full details |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB connection, env config
│   │   ├── controllers/      # Auth, borrower, sales, sanction,
│   │   │                     # disbursement, collection, admin
│   │   ├── middleware/       # verifyToken, authorizeRoles,
│   │   │                     # uploadMiddleware, errorHandler
│   │   ├── models/           # User, Application, Loan, Payment
│   │   ├── routes/           # One file per role/module
│   │   ├── services/         # breService, loanCalculator
│   │   ├── seeds/            # seedRoles.ts
│   │   └── utils/            # respond, errors, jwt, sanitize
│   ├── uploads/              # Stored salary slip files
│   ├── .env.example
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # login, register
│   │   │   ├── (borrower)/   # personal-details, upload-slip,
│   │   │   │                 # loan-config, status
│   │   │   └── (dashboard)/  # sales, sanction, disbursement,
│   │   │                     # collection, admin
│   │   ├── components/       # ProtectedRoute, ui/ library
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useAuth, useLoan
│   │   ├── lib/              # api (axios), jwt, storage
│   │   └── types/            # Shared TypeScript interfaces
│   ├── .env.example
│   └── tsconfig.json
└── README.md
```

---

## Available Scripts

### Backend

| Script          | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to dist/      |
| `npm start`     | Run compiled production server   |
| `npm run seed`  | Create default role accounts     |

### Frontend

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Build for production     |
| `npm start`     | Start production server  |
