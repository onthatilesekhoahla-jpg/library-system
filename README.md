# Library Management System (BIWA2110 – Web Application Development)

A responsive library management application built with **React + Vite**, **Express REST API**, and **PostgreSQL**. The project is organised into separate `frontend/` and `backend/` folders for GitHub submission.

## 1. Requirements
- Node.js (LTS) and npm
- PostgreSQL
- A code editor such as Visual Studio Code

## 2. Configure PostgreSQL and the backend
1. Install PostgreSQL and remember the password you create for the `postgres` database user.
2. Open pgAdmin or SQL Shell (psql) and create a database named `library_db`.
3. Open a terminal in the project `backend` folder and install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env`. On Windows, you can copy the file in File Explorer or run `copy .env.example .env` in Command Prompt.
5. Open `backend/.env` and set `DB_PASSWORD` to the PostgreSQL password you chose. Change `JWT_SECRET` to a long, private random value. Do not upload `.env` to GitHub.
6. Create the database tables and sample accounts:
   ```bash
   npm run init-db
   ```
7. Start the API:
   ```bash
   npm start
   ```
   The API runs at `http://localhost:5000`.

## 3. Start the React frontend
Open a **second terminal** in the project `frontend` folder:
```bash
npm install
copy .env.example .env
npm run dev
```
Open the local address printed by Vite (normally `http://localhost:5173`). Keep both terminal windows running while using the system.

## Demo accounts
| Role | Membership ID | Password |
|---|---|---|
| Admin | `ADMIN001` | `admin123` |
| Librarian | `LIB001` | `librarian123` |
| Member | `MEM001` | `member123` |

These are demonstration credentials. Change them before using the application beyond a classroom demonstration.

## Features mapped to the assignment
- **React frontend:** React hooks, reusable components, controlled forms, client-side validation, React Router navigation, and Fetch API integration.
- **Dashboard:** book availability, search, card/table views, and low-stock highlighting when quantity is below 2.
- **Book Management:** create, read, update, and delete books with title, author, genre, ISBN, and quantity.
- **Transactions:** record stock additions and borrowing deductions, view transaction history, edit/delete transactions, and automatically recalculate stock when a transaction is edited or deleted. Database transactions and row locks protect stock from becoming negative.
- **User Management:** login and administrator-only create, read, update, and delete user accounts with name, membership ID, role, and password.
- **Backend security:** login issues a signed, expiring bearer token. Backend middleware checks the token and current database role on protected endpoints; permissions are enforced by the API, not only by the React interface.
- **Database:** PostgreSQL tables for users, books, and transactions. Passwords are stored as bcrypt hashes.
- **Responsive interface:** pink theme and layouts that adapt to smaller screens.

## API routes
| Method | Route | Purpose / access |
|---|---|---|
| POST | `/users/login` | Authenticate and receive a signed token |
| GET | `/books`, `/books/:id` | Read books (signed-in users) |
| POST | `/books` | Add a book (admin/librarian) |
| PUT / DELETE | `/books/:id` | Update/delete a book (admin/librarian) |
| GET | `/transactions` | Read transaction history (admin/librarian) |
| POST | `/transactions` | Record stock addition or borrowing (admin/librarian) |
| PUT / DELETE | `/transactions/:id` | Edit/delete a transaction and adjust stock safely (admin/librarian) |
| GET | `/users`, `/users/:id` | Read user records (admin/librarian) |
| POST | `/users` | Create a user (admin) |
| PUT / DELETE | `/users/:id` | Update/delete a user (admin) |

The server uses `express.json()`, `cors()`, and a central error handler. API requests other than login require `Authorization: Bearer <token>`.

## GitHub submission
From the project root:
```bash
git init
git add .
git commit -m "Library Management System"
git branch -M main
```
Create an empty GitHub repository, then connect and push it:
```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Submit the GitHub repository URL as required by your lecturer. Do not commit your real `.env` file or database password.
