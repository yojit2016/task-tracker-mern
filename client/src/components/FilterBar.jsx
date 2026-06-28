import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * FilterBar component for querying, filtering, and sorting tasks.
 * Includes a debounced search input and quick toggle sort orders.
 * 
 * @param {object} props
 * @param {object} props.filters - Current filter states: { status, priority, search, sortBy, order }
 * @param {function} props.onFilterChange - Filter state modifier: (key, value) => void
 * @param {function} props.onCreateTrigger - Action to open the create task dialog
 */
const FilterBar = ({ filters, onFilterChange, onCreateTrigger }) => {
  const [searchText, setSearchText] = useState(filters.search || '');

  // Debounce search text input changes (400ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Handle syncing local search state if filters search is cleared externally
  useEffect(() => {
    if (filters.search !== searchText) {
      setSearchText(filters.search || '');
    }
  }, [filters.search]);

  const toggleSortOrder = () => {
    const nextOrder = filters.order === 'desc' ? 'asc' : 'desc';
    onFilterChange('order', nextOrder);
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#111827] flex flex-col gap-4">
      {/* Top Section: Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-hidden focus:ring-2 focus:border-brand-500 focus:ring-brand-100 dark:border-slate-800 dark:bg-[#1f2937] dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-950/50"
          />
        </div>

        {/* Create Task Button */}
        <button
          onClick={onCreateTrigger}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-98 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Bottom Section: Filtering and Sorting */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filterStatus" className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Status:
          </label>
          <select
            id="filterStatus"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-hidden dark:border-slate-850 dark:bg-[#1f2937] dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filterPriority" className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Priority:
          </label>
          <select
            id="filterPriority"
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-hidden dark:border-slate-855 dark:bg-[#1f2937] dark:text-slate-200"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Sort criteria */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <label htmlFor="sortCriteria" className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Sort by:
          </label>
          <select
            id="sortCriteria"
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-hidden dark:border-slate-860 dark:bg-[#1f2937] dark:text-slate-200"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority Rank</option>
          </select>
        </div>

        {/* Sort Order Toggler */}
        <button
          onClick={toggleSortOrder}
          title={`Sort ${filters.order === 'desc' ? 'Descending' : 'Ascending'}`}
          className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
        >
          {filters.order === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
        </button>

      </div>
    </div>
  );
};

export default FilterBar;
