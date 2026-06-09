# Dompe Shop & Funds Management System

A professional, full-stack web application designed to manage shops, collect monthly payments, track funds, and generate professional PDF reports. 

This repository is structured as a monorepo containing:
* **Frontend**: A React application powered by Vite, utilizing modern styling, client-side routing, and interactive visualization charts.
* **Backend**: A RESTful API built with Node.js, Express, and MongoDB, handling data models for users, payments, and funds.

---

## 🚀 Deployment Overview

### Frontend
* **Hosting Platform**: [Vercel](https://vercel.com/)
* **URL**: [https://vercel.com/](https://vercel.com/) (or your custom Vercel subdomain)
* **Build Command**: `npm run build`
* **Output Directory**: `dist`

### Backend
* **Hosting Platform**: [Railway](https://railway.app/)
* **URL**: `https://dompesystem-production.up.railway.app`
* **Container Port**: Configured to run on port `5000` (or dynamically assigned by Railway via `process.env.PORT`)
* **Database**: MongoDB Atlas Cluster

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (v19) | Modern component-based user interface. |
| | Vite | Fast build tool and dev server. |
| | Axios | Promised-based HTTP client for API requests. |
| | jsPDF | Professional letterhead PDF report generator. |
| | Recharts | Interactive SVG charting library for payment visualization. |
| | Vanilla CSS | Custom, cohesive, and modern responsive design system. |
| **Backend** | Node.js | JavaScript runtime environment. |
| | Express.js | Minimalist web framework for routing and middleware. |
| | MongoDB | NoSQL document database. |
| | Mongoose | Elegant object data modeling (ODM) for MongoDB. |
| | dotenv | Zero-dependency module to load environment variables. |

---

## 📡 API Specification

All API endpoints are prefixed with the base API URL (e.g., `https://system.up.railway.app`).

### 1. Shop Owner Accounts (`/users`)
Handles shop registration, profile updates, and search queries.

* **`GET /users`** — Retrieve all registered shop records.
* **`POST /users`** — Create/register a new shop.
  * *Request Body*: `{ "shop_owner_name": string, "shop_name": string, "phone_number": string }`
* **`GET /users/:id`** — Get a single shop by its database ObjectId.
* **`GET /users/reg/:reg_no`** — Get a single shop by its assigned auto-increment registration number.
* **`PUT /users/:id`** — Update a shop's details.
  * *Request Body*: `{ "shop_owner_name": string, "shop_name": string, "phone_number": string }`
* **`DELETE /users/:id`** — Delete a shop account from the database.

### 2. Payments (`/payments`)
Manages monthly fee collection, payment history, and year-specific billing records.

* **`POST /payments`** — Add a payment record.
  * *Request Body*: `{ "reg_no": string, "year": number, "month": number[], "cash": number }`
* **`GET /payments/reg/:reg_no`** — Fetch payment transactions belonging to a specific registration number.
* **`PUT /payments/:id`** — Update details of an existing payment transaction.
* **`DELETE /payments/:id`** — Remove a payment transaction record.

### 3. Consolidated Funds (`/funds`)
Provides combined data representations for visual reporting and database joins.

* **`GET /funds`** — Returns a complete list of users/shops aggregated with their corresponding payment transactions.

---

## ⚙️ Environment Variables

Before running the application locally or deploying to staging, make sure to configure the environment variables as follows:

### Frontend Environment Setup (`FrontEnd/.env`)
Create a `.env` file inside the `FrontEnd` directory:
```env
VITE_API_URL=https://system.up.railway.app
```

### Backend Environment Setup (`BackEnd/.env`)
Create a `.env` file inside the `BackEnd` directory (ensure this file is added to `.gitignore` so database credentials are never committed):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
PORT=5000
```

---

## 💻 Local Development Setup

To run both the frontend and backend servers locally, follow these steps:

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v16.x or higher recommended)
* Running MongoDB instance or active MongoDB Atlas cluster URI

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd dompe_System
```

### Step 2: Running the Backend
```bash
cd BackEnd
npm install
npm run dev # Starts development server on port 5000 with nodemon
```

### Step 3: Running the Frontend
Open a new terminal window:
```bash
cd FrontEnd
npm install
npm run dev # Starts local Vite dev server (usually http://localhost:5173)
```

---

## 📂 Key Directory Structures

```text
dompe_System/
├── BackEnd/
│   ├── Controlers/     # Express route handlers / business logic
│   ├── Model/          # Mongoose database schemas (UserModel, PaymentModel, etc.)
│   ├── Routes/         # Express endpoint definitions
│   ├── app.js          # App server setup & DB connection entrypoint
│   └── package.json
├── FrontEnd/
│   ├── src/
│   │   ├── Components/ # UI components (Nav, Admin, Users, Funds, MonthlyPayment)
│   │   ├── App.jsx     # Main React routes
│   │   └── main.jsx    # React application entrypoint
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```
