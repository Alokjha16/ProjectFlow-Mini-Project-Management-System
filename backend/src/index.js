require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');

const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Project Management API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/projects', projectsRouter);
app.use('/projects/:project_id/tasks', tasksRouter);
app.use('/tasks', tasksRouter);   // Enables PUT/DELETE /tasks/:id

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │   Project Management API                │
  │   Running on http://localhost:${PORT}      │
  │   Environment: ${process.env.NODE_ENV || 'development'}           │
  └─────────────────────────────────────────┘
  `);
});

module.exports = app;
