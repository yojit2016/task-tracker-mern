import React from 'react';
import TaskCard from './TaskCard';
import { ClipboardList, RotateCcw } from 'lucide-react';

/**
 * TaskList component to render a grid of TaskCards or a styled empty state.
 * 
 * @param {object} props
 * @param {Array} props.tasks - Array of task objects
 * @param {function} props.onEdit - Action to trigger edit modal for a task
 * @param {function} props.onDelete - Action to delete a task
 * @param {function} props.onStatusChange - Action to update status for a task
 * @param {function} props.onClearFilters - Action to reset query filters
 */
const TaskList = ({ tasks, onEdit, onDelete, onStatusChange, onClearFilters }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-ledger-border bg-ledger-surface p-12 text-center animate-fade-in mt-6">
        <div className="rounded-sm bg-ledger-bg p-3 text-ledger-ink/40 mb-4 border border-ledger-border">
          <ClipboardList size={28} />
        </div>
        <h3 className="font-display text-lg font-bold text-ledger-ink">
          This page is blank.
        </h3>
        <p className="mt-1 text-xs text-ledger-ink/65 max-w-xs font-sans">
          Add an entry to get started or reset the filter criteria.
        </p>
        
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center gap-1.5 rounded-sm border border-ledger-border bg-ledger-bg px-4 py-2 text-xs font-semibold text-ledger-ink hover:bg-ledger-surface transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-ledger-border divide-y divide-ledger-border bg-ledger-surface rounded-sm mt-6">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskList;
