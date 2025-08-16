# Approval App (Angular 20 + Express + PostgreSQL, JWT, No ORM)

## Prereqs
- Node 18+
- PostgreSQL 13+
- Angular CLI 20: `npm i -g @angular/cli`

## 1) Database
Create DB and apply schema:
```bash
createdb approval_db
psql -d approval_db -f backend/schema.sql
```
Update `backend/.env` for your DB credentials and set a strong `JWT_SECRET`.

## 2) Backend
```bash
cd backend
npm install
npm run dev  # http://localhost:4000
```
Endpoints:
- `POST /auth/register` (user)
- `POST /auth/login`
- `POST /requests` (user)
- `GET /requests` (user: own; admin: all)
- `PATCH /requests/:id/status` (admin)

## 3) Frontend
```bash
cd frontend
npm install
npm start   # http://localhost:4200
```
Login as admin: `admin@example.com / Admin@123` (then change password hash in DB).

## Notes
- No ORM; raw SQL via `pg` only.
- Single admin seeded by SQL. Keep admin registration disabled on UI.
- CORS is enabled for local dev.
