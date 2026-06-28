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
      return { text: 'No due date', className: 'text-ledger-ink/30', icon: null };
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
        text: `Done: ${formatted}`,
        className: 'text-ledger-ink/30 line-through',
        icon: <CheckCircle2 size={12} className="text-status-completed/55" />
      };
    }

    if (due < today) {
      return {
        text: `Overdue: ${formatted}`,
        className: 'text-status-high font-bold',
        icon: <AlertCircle size={12} className="text-status-high" />,
        isOverdue: true
      };
    }

    if (due.getTime() === today.getTime()) {
      return {
        text: `Today: ${formatted}`,
        className: 'text-status-pending font-bold',
        icon: <Clock size={12} className="text-status-pending" />,
        isDueToday: true
      };
    }

    return {
      text: `Due: ${formatted}`,
      className: 'text-ledger-ink/60',
      icon: <Calendar size={12} className="text-ledger-ink/40" />
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
    <div className="relative flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 bg-ledger-surface animate-fade-in hover:bg-ledger-bg/15 transition-colors border-b border-ledger-border last:border-b-0">
      {/* Delete Confirmation Overlay inside the card */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-between bg-ledger-surface/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-status-high animate-pulse" />
            <div>
              <h4 className="font-display text-sm font-bold text-ledger-ink">Delete this entry?</h4>
              <p className="text-[11px] text-ledger-ink/60">This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="rounded-sm border border-ledger-border px-3 py-1.5 text-xs font-semibold text-ledger-ink bg-ledger-bg hover:bg-ledger-surface transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-sm bg-status-high px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-colors cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div className="flex-1 min-w-0 pr-4 flex items-start gap-3">
        {/* Custom status toggle indicator */}
        <button
          onClick={toggleStatus}
          className="flex-shrink-0 cursor-pointer rounded-xs border border-ledger-border bg-ledger-bg text-status-completed hover:border-ledger-brass transition-all flex items-center justify-center h-5 w-5 mt-0.5 focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
          title={`Mark as ${task.status === 'completed' ? 'pending' : 'completed'}`}
        >
          {task.status === 'completed' && <span className="h-2.5 w-2.5 bg-status-completed rounded-xs"></span>}
        </button>

        <div className="min-w-0">
          <h3 className={`font-sans text-sm font-bold tracking-tight text-ledger-ink ${task.status === 'completed' ? 'line-through text-ledger-ink/35' : ''}`}>
            {task.title}
          </h3>
          <p className={`mt-2 text-xs text-ledger-ink/65 leading-relaxed ${task.status === 'completed' ? 'text-ledger-ink/35' : ''}`}>
            {task.description || <em className="text-ledger-ink/20">No description.</em>}
          </p>
        </div>
      </div>

      {/* Footer info & action buttons */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-6 pl-8 md:pl-0">
        
        {/* Due Date Indicator (mono face) */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {dateInfo.icon}
          <span className={dateInfo.className}>{dateInfo.text}</span>
        </div>

        {/* Priority badge */}
        <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-ledger-bg/85 border border-ledger-border/40 ${
          task.priority === 'high' ? 'text-status-high' : task.priority === 'medium' ? 'text-status-pending' : 'text-ledger-ink/60'
        }`}>
          {task.priority}
        </span>

        {/* Status Ink-Stamp Badge */}
        <div className="flex-shrink-0 flex items-center justify-center min-w-[95px]">
          <span 
            onClick={toggleStatus}
            className={`cursor-pointer font-mono text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-xs border-2 border-double select-none transition-all duration-150 active:scale-95 ${
              task.status === 'pending'
                ? 'border-status-pending text-status-pending rotate-[1.5deg]'
                : task.status === 'in-progress'
                ? 'border-status-progress text-status-progress rotate-[-2deg]'
                : 'border-status-completed text-status-completed rotate-[2.5deg]'
            }`}
          >
            {task.status.replace('-', ' ')}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="rounded-sm p-1.5 text-ledger-ink/40 hover:bg-ledger-bg hover:text-ledger-ink transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
          >
            <Edit2 size={13} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete Task"
            className="rounded-sm p-1.5 text-ledger-ink/40 hover:bg-ledger-bg hover:text-status-high transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
          >
            <Trash2 size={13} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TaskCard;
