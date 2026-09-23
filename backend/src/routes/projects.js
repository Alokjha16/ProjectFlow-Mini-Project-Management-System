/./././const express = require('express');
const router = express.Router();
const { getDB, dbRun, dbGet, dbAll } = require('../db/database');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { projectCreateValidator, projectIdValidator, paginationValidator } = require('../validators/projectValidators');

// POST /projects
router.post('/', projectCreateValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const { name, description } = req.body;
    const result = dbRun('INSERT INTO projects (name, description) VALUES (?,?)', [name, description || null]);
    const project = dbGet('SELECT * FROM projects WHERE id=?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Project created successfully', data: project });
  } catch (err) { next(err); }
});

// GET /projects
router.get('/', paginationValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const total = dbGet('SELECT COUNT(*) as count FROM projects').count;
    const projects = dbAll('SELECT * FROM projects ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    const withCounts = projects.map(p => {
      const tc = dbGet(`SELECT COUNT(*) as total,
        SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status='in-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done
        FROM tasks WHERE project_id=?`, [p.id]);
      return { ...p, task_counts: tc };
    });
    res.json({ success: true, data: withCounts, pagination: { total, page, limit, total_pages: Math.ceil(total/limit), has_next: page < Math.ceil(total/limit), has_prev: page > 1 } });
  } catch (err) { next(err); }
});

// GET /projects/:id
router.get('/:id', projectIdValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const project = dbGet('SELECT * FROM projects WHERE id=?', [req.params.id]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const tc = dbGet(`SELECT COUNT(*) as total, SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo, SUM(CASE WHEN status='in-progress' THEN 1 ELSE 0 END) as in_progress, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done FROM tasks WHERE project_id=?`, [project.id]);
    res.json({ success: true, data: { ...project, task_counts: tc } });
  } catch (err) { next(err); }
});

// DELETE /projects/:id
router.delete('/:id', projectIdValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const project = dbGet('SELECT id FROM projects WHERE id=?', [req.params.id]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    dbRun('DELETE FROM tasks WHERE project_id=?', [req.params.id]);
    dbRun('DELETE FROM projects WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
