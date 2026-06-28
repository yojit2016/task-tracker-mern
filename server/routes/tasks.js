const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { body, validationResult } = require('express-validator');

// Validation rules for creating a task (title required)
const validateTaskCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

// Validation rules for updating a task (title optional, but can't be empty if provided)
const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

// Middleware to check validation results and format error messages
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        path: err.path,
        msg: err.msg
      }))
    });
  }
  next();
};

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with optional filters, search, and sorting
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, sortBy, order, search } = req.query;
    const filter = {};

    // 1. Filtering
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }

    // 2. Search (matches title case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // 3. Database Sorting (for dueDate and createdAt)
    let sortOption = {};
    const sortOrder = order === 'desc' ? -1 : 1;

    if (sortBy === 'dueDate') {
      sortOption.dueDate = sortOrder;
    } else if (sortBy === 'createdAt') {
      sortOption.createdAt = sortOrder;
    } else if (!sortBy) {
      // Default sort is newest tasks first
      sortOption.createdAt = -1;
    }

    let tasks = await Task.find(filter).sort(sortOption);

    // 4. Custom Sorting (for priority ranking: low < medium < high)
    if (sortBy === 'priority') {
      const priorityWeights = { low: 1, medium: 2, high: 3 };
      tasks.sort((a, b) => {
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        return order === 'desc' ? weightB - weightA : weightA - weightB;
      });
    }

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post('/', validateTaskCreate, checkValidation, async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task (partial updates allowed)
 * @access  Public
 */
router.put('/:id', validateTaskUpdate, checkValidation, async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${req.params.id}`
      });
    }

    // Set non-provided fields for update (keep them as-is)
    const updates = req.body;
    
    // Explicitly handle resetting due date to null if sent as empty/null
    if (updates.hasOwnProperty('dueDate') && (updates.dueDate === '' || updates.dueDate === null)) {
      updates.dueDate = null;
    }

    task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task not found with id of ${req.params.id}`
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
