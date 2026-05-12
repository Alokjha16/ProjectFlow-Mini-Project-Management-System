<<<<<<< HEAD
# 🚀 ProjectFlow — Mini Project Management System

A full-stack Project Management System with REST APIs (Node.js/Express) and a responsive dark-themed UI.

---

## 📁 Project Structure

```
project-management/
├── backend/
│   ├── src/
│   │   ├── db/database.js          # SQLite setup & schema
│   │   ├── middleware/errorHandler.js
│   │   ├── routes/
│   │   │   ├── projects.js         # Project CRUD
│   │   │   └── tasks.js            # Task CRUD
│   │   ├── validators/
│   │   │   ├── projectValidators.js
│   │   │   └── taskValidators.js
│   │   └── index.js                # Express app entry
│   ├── .env
│   └── package.json
├── frontend/
│   └── index.html                  # Single-page UI
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+ ([download](https://nodejs.org))

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

The `.env` file is already set up. Defaults:
```
PORT=5000
NODE_ENV=development
```

### 3. Start the Backend Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

### 4. Open the Frontend

Simply open `frontend/index.html` in your browser:

```bash
# macOS
open frontend/index.html

# Windows
start frontend/index.html

# Linux
xdg-open frontend/index.html
```

> **Note:** No build step required. The frontend is a pure HTML/CSS/JS single page.

---

## 🗄️ Database

- **SQLite** (file-based, zero config)
- Database file auto-created at `backend/database.sqlite` on first run
- Foreign key constraints enabled (cascade delete tasks when project is deleted)

### Schema

```sql
CREATE TABLE projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo' CHECK(status IN ('todo','in-progress','done')),
  priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
  due_date    DATE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 API Documentation

Base URL: `http://localhost:5000`

### Health Check

| Method | Endpoint   | Description       |
|--------|------------|-------------------|
| GET    | `/health`  | Server health     |

---

### Projects API

#### POST `/projects` — Create Project

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "description": "Online shopping system"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "name": "E-commerce Platform",
    "description": "Online shopping system",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### GET `/projects` — List Projects (Paginated)

**Query Params:**

| Param   | Type    | Default | Description              |
|---------|---------|---------|--------------------------|
| `page`  | integer | 1       | Page number              |
| `limit` | integer | 10      | Items per page (max 100) |

**Example:** `GET /projects?page=1&limit=10`

**Response `200`:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

#### GET `/projects/:id` — Get Single Project

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "E-commerce Platform",
    "task_counts": { "total": 5, "todo": 2, "in_progress": 1, "done": 2 }
  }
}
```

---

#### DELETE `/projects/:id` — Delete Project

Deletes project and all associated tasks (cascade).

**Response `200`:**
```json
{ "success": true, "message": "Project deleted successfully" }
```

---

### Tasks API

#### POST `/projects/:project_id/tasks` — Create Task

**Request Body:**
```json
{
  "title": "Design homepage",
  "description": "Create wireframes and mockups",
  "status": "todo",
  "priority": "high",
  "due_date": "2024-02-01"
}
```

---

#### GET `/projects/:project_id/tasks` — List Tasks

**Query Params:**

| Param      | Type    | Options                        | Default      |
|------------|---------|--------------------------------|--------------|
| `page`     | integer | —                              | 1            |
| `limit`    | integer | 1–100                          | 10           |
| `status`   | string  | `todo`, `in-progress`, `done`  | (all)        |
| `sort_by`  | string  | `due_date`, `created_at`, `priority` | `created_at` |
| `order`    | string  | `asc`, `desc`                  | `desc`       |

**Example:** `GET /projects/1/tasks?status=in-progress&sort_by=due_date&order=asc`

---

#### PUT `/tasks/:id` — Update Task

Accepts any combination of fields (partial update):
```json
{
  "status": "done",
  "priority": "low"
}
```

---

#### DELETE `/tasks/:id` — Delete Task

```json
{ "success": true, "message": "Task deleted successfully" }
```

---

## ✅ Features Implemented

| Feature                     | Status |
|-----------------------------|--------|
| Project CRUD                | ✅     |
| Task CRUD                   | ✅     |
| Pagination                  | ✅     |
| Filter tasks by status      | ✅     |
| Sort tasks by due_date      | ✅     |
| Sort tasks by priority      | ✅     |
| Input validation            | ✅     |
| Error handling              | ✅     |
| Task counts per project     | ✅     |
| Cascade delete              | ✅     |  
| Dark mode UI                | ✅     |

---

## 🔍 Error Response Format

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Project not found"
}
```

Validation errors (422):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "name", "message": "Project name is required" }
  ]
}
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Runtime   | Node.js 18+                       |
| Framework | Express 4.x                       |
| Database  | SQLite (via better-sqlite3)       |
| Validation| express-validator                  |
| Frontend  | Vanilla HTML/CSS/JS (no framework) |

---


