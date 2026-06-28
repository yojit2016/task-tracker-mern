# Ledger

A production-ready, highly responsive Task Tracker web application built using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS v4, axios, express-validator, and centralized error handling.

## Project Structure

This project is set up as a monorepo:
```text
/client   → React frontend (Vite + Tailwind CSS v4)
/server   → Node.js + Express backend (MongoDB + Mongoose)
```

---

## Features

- **Full CRUD Operations**: Create, read, update, and delete tasks instantly (no full page reloads).
- **Search & Filter**: Find tasks by title, filter by status (pending, in-progress, completed) and priority (low, medium, high).
- **Multi-criteria Sorting**: Sort tasks by due date, priority, or creation time in ascending or descending order.
- **Form Validation**: Client-side validations for required fields and logical constraints (e.g. no past due dates for new tasks) and server-side strict validation via `express-validator`.
- **Theme Support**: Modern and premium dark mode toggle.
- **Beautiful UI**: Visual indicators for status, priority, and overdue dates, equipped with skeleton loading screens.
- **Notifications**: Toast notifications for all success and error actions.

---

## Environment Variables

### Backend (`/server/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5000` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://localhost:27017/tasktracker` |
| `CLIENT_URL` | Deployed Frontend URL (for CORS) | `http://localhost:5173` |

### Frontend (`/client/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of backend API | `http://localhost:5000` |

---

## Getting Started (Local Development)

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running local instance or a MongoDB Atlas URI

### Step 1: Clone the Repository
Ensure you are in the project folder:
```bash
cd task-tracker-mern
```

### Step 2: Set up the Backend Server
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server in development mode (with nodemon):
   ```bash
   npm run dev
   ```

### Step 3: Set up the Frontend Client
1. Open a new terminal window and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## API Documentation

### Base Route: `/api/tasks`

All requests should respond with a JSON payload of the form:
```json
{
  "success": true,
  "data": ...
}
```
Or for errors:
```json
{
  "success": false,
  "message": "Error description text",
  "errors": [] // Optional validation errors
}
```

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Get all tasks | `status`, `priority`, `search` (title matches), `sortBy` (`dueDate`, `createdAt`, `priority`), `order` (`asc`/`desc`) |
| **GET** | `/api/tasks/:id` | Get task by ID | None |
| **POST** | `/api/tasks` | Create a task | Require: `title`. Optional: `description`, `status`, `priority`, `dueDate` |
| **PUT** | `/api/tasks/:id` | Update a task | Partial updates allowed |
| **DELETE** | `/api/tasks/:id`| Delete task | None |
| **GET** | `/api/health` | Uptime check | Returns `{ "status": "ok" }` |

---

## Deployment Guide

### 1. MongoDB Atlas Setup
1. Sign up/Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere, required for Render).
4. In **Database Access**, create a user with read/write permissions.
5. Click **Connect** → **Drivers** and copy the Connection String (`mongodb+srv://...`). Replace `<password>` with your user's password.

### 2. Backend Deployment on Render
1. Sign up/Log in to [Render](https://render.com).
2. Click **New** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following fields:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGO_URI`: *Your MongoDB Atlas Connection String*
   - `CLIENT_URL`: *Your Vercel deployment URL (e.g. `https://your-app.vercel.app`)*
   - `PORT`: `10000` (Render binds automatically, but safe to set or omit)
6. Deploy the Web Service.

### 3. Frontend Deployment on Vercel
1. Sign up/Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project** and import your GitHub repository.
3. Set the following configuration:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: *Your Render backend URL (e.g. `https://your-api.onrender.com`)*
5. Click **Deploy**.

> [!IMPORTANT]
> Once both services are deployed, update the `CLIENT_URL` environment variable on Render to point to the live Vercel frontend URL, then trigger a manual redeployment on Render to apply CORS restrictions properly.
