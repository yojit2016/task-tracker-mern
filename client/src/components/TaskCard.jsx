import React, { useState } from 'react';
import { Calendar, Edit2, Trash2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

/**
 * TaskCard component to display individual task details.
 * Contains inline deletion prompts, date formatting, and badge colors.
 * 
 * @param {object} props
 * @param {object} props.task - The task details
 * @param {function} props.onEdit - Edit action handler: (task) => void
 * @param {function} props.onDelete - Delete action handler: (id) => Promise<void>
 * @param {function} props.onStatusChange - Fast toggle status: (id, newStatus) => Promise<void>
 */
const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status-specific Badge styling
  const statusStyles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
  };

  // Priority-specific Badge styling
  const priorityStyles = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400',
    medium: 'bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-400',
    high: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
  };

  // Helper for due date logic
  const getDueDateInfo = () => {
    if (!task.dueDate) {
      return { text: 'No due date', className: 'text-slate-400 dark:text-slate-500', icon: null };
    }

    // Strip time to compare dates fairly at midnight local/UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    // Format Date string
    const formatted = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (task.status === 'completed') {
      return {
        text: `Completed: ${formatted}`,
        className: 'text-slate-400 dark:text-slate-500 line-through',
        icon: <CheckCircle2 size={13} className="text-emerald-500" />
      };
    }

    if (due < today) {
      return {
        text: `Overdue: ${formatted}`,
        className: 'text-rose-600 dark:text-rose-400 font-semibold',
        icon: <AlertCircle size={13} className="animate-bounce" />,
        isOverdue: true
      };
    }

    if (due.getTime() === today.getTime()) {
      return {
        text: `Due Today: ${formatted}`,
        className: 'text-amber-600 dark:text-amber-400 font-semibold',
        icon: <Clock size={13} />,
        isDueToday: true
      };
    }

    return {
      text: `Due: ${formatted}`,
      className: 'text-slate-500 dark:text-slate-400',
      icon: <Calendar size={13} />
    };
  };

  const dateInfo = getDueDateInfo();

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task._id);
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleStatus = () => {
    const nextStatus = 
      task.status === 'pending' 
        ? 'in-progress' 
        : task.status === 'in-progress' 
        ? 'completed' 
        : 'pending';
    onStatusChange(task._id, nextStatus);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/80 dark:bg-[#111827] animate-fade-in flex flex-col justify-between h-full">
      {/* Delete Confirmation Overlay inside the card */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 p-4 text-center backdrop-blur-xs dark:bg-[#111827]/95">
          <AlertCircle size={32} className="text-rose-500 mb-2 animate-pulse" />
          <h4 className="font-heading text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Delete this task?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mb-4">
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div>
        {/* Header: Title and Badges */}
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-heading text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
            {task.title}
          </h3>
          <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[task.status]}`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>

        {/* Description */}
        <p className={`mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed ${task.status === 'completed' ? 'text-slate-400 dark:text-slate-600' : ''}`}>
          {task.description || <em className="text-slate-300 dark:text-slate-700">No description provided.</em>}
        </p>
      </div>

      {/* Footer info & action buttons */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
        
        {/* Due Date Indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {dateInfo.icon}
          <span className={dateInfo.className}>{dateInfo.text}</span>
        </div>

        {/* Priority and Action buttons */}
        <div className="flex items-center gap-3">
          {/* Priority badge */}
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>

          <div className="flex items-center gap-1">
            {/* Quick Status Toggle checkbox/check icon */}
            <button
              onClick={toggleStatus}
              title={`Mark as ${task.status === 'completed' ? 'pending' : 'completed'}`}
              className={`rounded-lg p-1.5 text-slate-400 hover:text-brand-500 dark:text-slate-500 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
            >
              <CheckCircle2 size={16} className={task.status === 'completed' ? 'text-emerald-500 dark:text-emerald-400' : ''} />
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Edit2 size={14} />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete Task"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskCard;
