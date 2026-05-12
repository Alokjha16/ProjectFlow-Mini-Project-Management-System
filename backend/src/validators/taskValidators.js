const { body, param, query } = require('express-validator');

const taskCreateValidator = [
  param('project_id')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be 2–200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('due_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('due_date must be a valid date (YYYY-MM-DD)')
    .toDate()
];

const taskUpdateValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be 2–200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('due_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('due_date must be a valid date (YYYY-MM-DD)')
    .toDate()
];

const taskListValidator = [
  param('project_id')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
  query('sort_by')
    .optional()
    .isIn(['due_date', 'created_at', 'priority']).withMessage('sort_by must be due_date, created_at, or priority'),
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = { taskCreateValidator, taskUpdateValidator, taskListValidator };
