# Ledger

A full-stack task tracker built with the MERN stack — clean REST API, real-time UI updates, and a record-keeping-inspired design instead of the usual SaaS dashboard look.

**Live App:** [ledger-joji.vercel.app](https://ledger-joji.vercel.app/)

<img width="1905" height="1073" alt="image" src="https://github.com/user-attachments/assets/f0ca3c2c-f32e-4528-80f2-a6ef7dc143eb" />


---

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Security](#security)
- [Design Notes](#design-notes)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- Full CRUD on tasks, with optimistic UI updates and no full page reloads
- Filtering by status/priority, sorting by due date/priority/created date, and live search
- Validation enforced on both client and server — the server is the source of truth
- Light/dark theme with persisted preference
- Toast feedback on every create/update/delete action
- Hardened API: rate limiting, NoSQL injection sanitization, locked-down CORS, and more (see [Security](#security))

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS v4, Axios, react-hot-toast, lucide-react |
| Backend | Node.js, Express, Mongoose, express-validator |
| Database | MongoDB Atlas |
| Security | helmet, express-rate-limit, express-mongo-sanitize |
| Hosting | Vercel (frontend), Render (backend) |

## Project Structure

```
ledger/
├── client/                # React frontend (Vite)
│   └── src/
│       ├── api/           # Axios layer — single source of truth for API calls
│       └── components/    # TaskForm, TaskCard, TaskList, FilterBar, Modal, SkeletonLoader
├── server/                # Express API
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Route handlers
│   └── middleware/        # Centralized error handling, validation
└── docs/                  # README assets
```

## Getting Started

**Prerequisites:** Node.js 18+, a MongoDB connection string ([Atlas](https://www.mongodb.com/cloud/atlas) or local).

```bash
# Backend
cd server
npm install
cp .env.example .env   # set MONGO_URI, PORT, CLIENT_URL
npm run dev

# Frontend (separate terminal)
cd client
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

Frontend runs at `http://localhost:5173`, API at `http://localhost:5000`.

## Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Server port (default `5000`) |
| `CLIENT_URL` | Allowed frontend origin, enforced via CORS |
| `NODE_ENV` | `development` or `production` |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

> The production `VITE_API_URL`/`CLIENT_URL` pair isn't published here on purpose — the API isn't meant for direct public use outside the deployed frontend. Anyone running this locally just points both at `localhost`.

## API Reference

Base path: `/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List tasks. Query: `status`, `priority`, `search`, `sortBy`, `order` |
| `GET` | `/api/tasks/:id` | Get a single task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task (partial updates allowed) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/health` | Health check |

**Task object**
```json
{
  "_id": "665f1b2e4f1a2b001c8e4a3d",
  "title": "Finish CQI Tracker review",
  "description": "Optional, max 500 chars",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-07-01T00:00:00.000Z",
  "createdAt": "2026-06-28T10:12:00.000Z",
  "updatedAt": "2026-06-28T10:12:00.000Z"
}
```

**Validation error shape**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title is required" }]
}
```

## Security

- `helmet` for secure HTTP response headers
- Rate limiting — 100 requests / 15 min / IP on task routes
- `express-mongo-sanitize` to strip `$`/`.` injection operators from input
- CORS locked to the deployed frontend origin in production
- Request body size capped at 10kb
- Generic error responses in production — no stack traces leaked to clients
- `X-Powered-By` disabled
- Past due dates rejected server-side, not just in the form

## Design Notes

The UI deliberately avoids the generic "dark dashboard with a neon accent" look. It's built around a ledger/record-keeping metaphor instead: ruled line-item rows rather than floating cards, monospace type for dates and counts (because a ledger's numbers are its most important content), and stamp-style status badges as the one distinctive visual device. Light and dark themes mirror the same concept rather than being two unrelated designs bolted together.

## Deployment

| Service | Role |
|---|---|
| Vercel | Frontend hosting, deployed from `client/` |
| Render | Backend hosting, deployed from `server/` |
| MongoDB Atlas | Database |

Each service is configured with its own environment variables (see [above](#environment-variables)); CORS and the API base URL are kept in sync between Render and Vercel so the two can only talk to each other.

## Roadmap

- [ ] Pagination for large task lists
- [ ] User authentication (currently single-user by design)
- [ ] Automated test suite (Jest/Vitest + Supertest)

## License

MIT — see [LICENSE](./LICENSE).

---

Built by Yojit.
