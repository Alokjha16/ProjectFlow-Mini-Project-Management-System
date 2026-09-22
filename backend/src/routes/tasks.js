const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDB, dbRun, dbGet, dbAll } = require('../db/database');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { taskCreateValidator, taskUpdateValidator, taskListValidator } = require('../validators/taskValidators');
const { param } = require('express-validator');

// POST /projects/:project_id/tasks
router.post('/', taskCreateValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const { project_id } = req.params;
    if (!dbGet('SELECT id FROM projects WHERE id=?', [project_id]))
      return res.status(404).json({ success: false, message: 'Project not found' });
    const { title, description, status, priority, due_date } = req.body;
    const result = dbRun(
      'INSERT INTO tasks (project_id, title, description, status, priority, due_date) VALUES (?,?,?,?,?,?)',
      [project_id, title, description||null, status||'todo', priority||'medium', due_date ? new Date(due_date).toISOString().split('T')[0] : null]
    );
    const task = dbGet('SELECT * FROM tasks WHERE id=?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (err) { next(err); }
});

// GET /projects/:project_id/tasks
router.get('/', taskListValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const { project_id } = req.params;
    if (!dbGet('SELECT id FROM projects WHERE id=?', [project_id]))
      return res.status(404).json({ success: false, message: 'Project not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, sort_by = 'created_at', order = 'desc' } = req.query;

    let where = 'WHERE project_id=?';
    const params = [project_id];
    if (status) { where += ' AND status=?'; params.push(status); }

    const sortMap = { due_date: 'due_date', created_at: 'created_at', priority: "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END" };
    const sortCol = sortMap[sort_by] || 'created_at';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';

    const total = dbGet(`SELECT COUNT(*) as count FROM tasks ${where}`, params).count;
    const tasks = dbAll(`SELECT * FROM tasks ${where} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`, [...params, limit, offset]);

    res.json({ success: true, data: tasks, filters: { status: status||null, sort_by, order }, pagination: { total, page, limit, total_pages: Math.ceil(total/limit), has_next: page < Math.ceil(total/limit), has_prev: page > 1 } });
  } catch (err) { next(err); }
});

// PUT /tasks/:id
router.put('/:id', taskUpdateValidator, handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    const task = dbGet('SELECT * FROM tasks WHERE id=?', [req.params.id]);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const { title, description, status, priority, due_date } = req.body;
    const u = {
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      due_date: due_date !== undefined ? (due_date ? new Date(due_date).toISOString().split('T')[0] : null) : task.due_date
    };
    dbRun('UPDATE tasks SET title=?,description=?,status=?,priority=?,due_date=? WHERE id=?', [u.title, u.description, u.status, u.priority, u.due_date, req.params.id]);
    res.json({ success: true, message: 'Task updated successfully', data: dbGet('SELECT * FROM tasks WHERE id=?', [req.params.id]) });
  } catch (err) { next(err); }
});

// DELETE /tasks/:id
router.delete('/:id', [param('id').isInt({ min: 1 })], handleValidationErrors, async (req, res, next) => {
  try {
    await getDB();
    if (!dbGet('SELECT id FROM tasks WHERE id=?', [req.params.id]))
      return res.status(404).json({ success: false, message: 'Task not found' });
    dbRun('DELETE FROM tasks WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
