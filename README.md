# Fix My Bangalore

Civic issue reporting app. The repo is split into two independent apps:

```
fixmybanglore/
├── frontend/   React 19 + Vite + Tailwind (shadcn/radix UI)
└── backend/    Express 5 + PostgreSQL (node-postgres)
```

## Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

`vite.config.js` proxies `/api` and `/uploads` to the backend at `http://localhost:5000`.

Scripts: `dev`, `build`, `preview`, `lint`.

## Backend

Needs a local PostgreSQL server running (any recent version).

```bash
cd backend
npm install
cp .env.example .env          # then edit DATABASE_URL with your Postgres password
npm run db:setup              # creates the database, tables, and the admin user
npm run dev                   # http://localhost:5000  (node --watch)
```

Scripts:

| Script | What it does |
| --- | --- |
| `start` / `dev` | run the API (`dev` restarts on file change) |
| `db:setup` | create the database (`scripts/create-db.js`) + tables + admin (`seedAdmin.js`) |
| `seed` | create/re-promote the admin user only |

The server also runs `schema.sql` on every start, so the tables are created automatically
if the database already exists.

### Environment (`backend/.env`)

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | `postgresql://user:password@host:5432/fixmybangalore` |
| `JWT_SECRET` | secret for signing login tokens |

### Schema

Two tables, defined in [`backend/schema.sql`](backend/schema.sql):

- `users` — `id`, `email`, `password` (bcrypt), `role` (`user` \| `admin`), timestamps
- `reports` — issue fields (`title`, `description`, `category`, `status`, `location` JSONB,
  `address`, `images` TEXT[], `reported_by`, `contact`, `severity`, `admin_notes`), timestamps

Default admin after `db:setup`: **admin@gmail.com** / **Admin@123**.

Uploaded images are stored on disk in `backend/uploads/` (git-ignored).
