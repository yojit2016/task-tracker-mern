import React, { useState, useEffect } from 'react';

/**
 * TaskForm component for creating and updating tasks.
 * Handles validation rules locally before submitting payload to the API.
 * 
 * @param {object} props
 * @param {object|null} props.editingTask - The task being edited, or null for creating
 * @param {function} props.onSubmit - Submit handler: (taskData) => Promise<void>
 * @param {function} props.onCancel - Action to dismiss/close the form
 */
const TaskForm = ({ editingTask, onSubmit, onCancel }) => {
  const isEdit = !!editingTask;

  // Initialize form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if editingTask changes
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'pending',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''
      });
      setErrors({});
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
      });
      setErrors({});
    }
  }, [editingTask]);

  // Client-side validation rule runner
  const validateField = (name, value) => {
    let error = '';

    if (name === 'title') {
      if (!value || value.trim() === '') {
        error = 'Title is required';
      } else if (value.length > 100) {
        error = 'Title cannot exceed 100 characters';
      }
    }

    if (name === 'description') {
      if (value && value.length > 500) {
        error = 'Description cannot exceed 500 characters';
      }
    }

    if (name === 'dueDate') {
      if (value && !isEdit) {
        // Enforce due date not in the past for new tasks
        const selected = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare date part only
        selected.setHours(0, 0, 0, 0);
        if (selected < today) {
          error = 'Due date cannot be in the past for new tasks';
        }
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Run validation on changes
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final checks
    const finalErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) finalErrors[key] = err;
    });

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass normalized values (convert empty due date to null)
      const payload = {
        ...formData,
        dueDate: formData.dueDate || null
      };
      await onSubmit(payload);
    } catch (err) {
      // If backend reports validation errors, map them
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach((e) => {
          backendErrors[e.path] = e.msg;
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is disabled
  const hasErrors = Object.values(errors).some((err) => !!err);
  const isTitleEmpty = !formData.title || formData.title.trim() === '';
  const isSubmitDisabled = hasErrors || isTitleEmpty || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ledger-ink/50 mb-1">
          Title <span className="text-status-high">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Write ledger entries"
          className={`w-full rounded-sm border px-3 py-2 text-sm bg-ledger-bg text-ledger-ink placeholder-ledger-ink/30 transition-all focus:outline-hidden focus:ring-1 focus:ring-ledger-brass/35 ${
            errors.title
              ? 'border-status-high focus:border-status-high focus:ring-status-high/30'
              : 'border-ledger-border focus:border-ledger-brass'
          }`}
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 font-mono text-[10px] text-status-high font-bold">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ledger-ink/50 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add details about this record..."
          rows={3}
          className={`w-full rounded-sm border px-3 py-2 text-sm bg-ledger-bg text-ledger-ink placeholder-ledger-ink/30 transition-all focus:outline-hidden focus:ring-1 focus:ring-ledger-brass/35 ${
            errors.description
              ? 'border-status-high focus:border-status-high focus:ring-status-high/30'
              : 'border-ledger-border focus:border-ledger-brass'
          }`}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="font-mono text-[10px] text-status-high font-bold">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="font-mono text-[9px] text-ledger-ink/40">
            {formData.description.length}/500
          </span>
        </div>
      </div>

      {/* Row: Status & Priority */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Status */}
        <div>
          <label htmlFor="status" className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ledger-ink/50 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-sm border border-ledger-border px-3 py-2 text-sm bg-ledger-bg text-ledger-ink focus:outline-hidden focus:border-ledger-brass"
          >
            <option value="pending" className="bg-ledger-surface">Pending</option>
            <option value="in-progress" className="bg-ledger-surface">In Progress</option>
            <option value="completed" className="bg-ledger-surface">Completed</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ledger-ink/50 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-sm border border-ledger-border px-3 py-2 text-sm bg-ledger-bg text-ledger-ink focus:outline-hidden focus:border-ledger-brass"
          >
            <option value="low" className="bg-ledger-surface">Low</option>
            <option value="medium" className="bg-ledger-surface">Medium</option>
            <option value="high" className="bg-ledger-surface">High</option>
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-ledger-ink/50 mb-1">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className={`w-full rounded-sm border px-3 py-2 text-sm bg-ledger-bg text-ledger-ink transition-all focus:outline-hidden focus:ring-1 focus:ring-ledger-brass/35 ${
            errors.dueDate
              ? 'border-status-high focus:border-status-high focus:ring-status-high/30'
              : 'border-ledger-border focus:border-ledger-brass'
          }`}
        />
        {errors.dueDate && (
          <p className="mt-1 font-mono text-[10px] text-status-high font-bold">
            {errors.dueDate}
          </p>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 border-t border-ledger-border pt-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm border border-ledger-border px-4 py-2 text-xs font-semibold text-ledger-ink bg-ledger-bg hover:bg-ledger-surface/60 transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`rounded-sm px-5 py-2 text-xs font-semibold shadow-xs transition-all duration-200 ${
            isSubmitDisabled
              ? 'bg-ledger-border text-ledger-ink/20 cursor-not-allowed shadow-none'
              : 'bg-ledger-brass text-[#15201C] hover:bg-ledger-brass-hover cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ledger-brass/45'
          }`}
        >
          {isSubmitting
            ? 'Saving...'
            : isEdit
            ? 'Save'
            : 'New Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
