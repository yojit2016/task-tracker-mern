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
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/10 animate-fade-in mt-6">
        <div className="rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-4">
          <ClipboardList size={32} />
        </div>
        <h3 className="font-heading text-base font-bold text-slate-800 dark:text-slate-200">
          No tasks found
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          No tasks match your selected query, search query, or filtering parameters.
        </p>
        
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
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
