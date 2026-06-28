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
    <div className="rounded-sm border border-ledger-border bg-ledger-surface p-4 flex flex-col gap-4">
      {/* Top Section: Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-ledger-ink/40">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search entries..."
            className="w-full rounded-sm border border-ledger-border pl-10 pr-4 py-2 text-sm bg-ledger-bg text-ledger-ink placeholder-ledger-ink/35 transition-all focus:outline-hidden focus:border-ledger-brass focus:ring-1 focus:ring-ledger-brass/30 font-sans"
          />
        </div>

        {/* Create Task Button */}
        <button
          onClick={onCreateTrigger}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-ledger-brass px-5 py-2 text-sm font-semibold text-[#15201C] shadow-xs hover:bg-ledger-brass-hover transition-all cursor-pointer font-sans focus:outline-hidden focus:ring-2 focus:ring-ledger-brass/40"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Bottom Section: Filtering and Sorting */}
      <div className="flex flex-wrap items-center gap-3 border-t border-ledger-border pt-4">
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filterStatus" className="font-mono text-[10px] font-semibold text-ledger-ink/50 uppercase tracking-widest">
            Status:
          </label>
          <select
            id="filterStatus"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="rounded-sm border border-ledger-border px-3 py-1.5 text-xs font-mono bg-ledger-bg text-ledger-ink focus:outline-hidden focus:border-ledger-brass"
          >
            <option value="" className="bg-ledger-surface text-ledger-ink">All Statuses</option>
            <option value="pending" className="bg-ledger-surface text-ledger-ink">Pending</option>
            <option value="in-progress" className="bg-ledger-surface text-ledger-ink">In Progress</option>
            <option value="completed" className="bg-ledger-surface text-ledger-ink">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filterPriority" className="font-mono text-[10px] font-semibold text-ledger-ink/50 uppercase tracking-widest">
            Priority:
          </label>
          <select
            id="filterPriority"
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="rounded-sm border border-ledger-border px-3 py-1.5 text-xs font-mono bg-ledger-bg text-ledger-ink focus:outline-hidden focus:border-ledger-brass"
          >
            <option value="" className="bg-ledger-surface text-ledger-ink">All Priorities</option>
            <option value="low" className="bg-ledger-surface text-ledger-ink">Low</option>
            <option value="medium" className="bg-ledger-surface text-ledger-ink">Medium</option>
            <option value="high" className="bg-ledger-surface text-ledger-ink">High</option>
          </select>
        </div>

        {/* Sort criteria */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <label htmlFor="sortCriteria" className="font-mono text-[10px] font-semibold text-ledger-ink/50 uppercase tracking-widest">
            Sort by:
          </label>
          <select
            id="sortCriteria"
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="rounded-sm border border-ledger-border px-3 py-1.5 text-xs font-mono bg-ledger-bg text-ledger-ink focus:outline-hidden focus:border-ledger-brass"
          >
            <option value="createdAt" className="bg-ledger-surface text-ledger-ink">Date Created</option>
            <option value="dueDate" className="bg-ledger-surface text-ledger-ink">Due Date</option>
            <option value="priority" className="bg-ledger-surface text-ledger-ink">Priority Rank</option>
          </select>
        </div>

        {/* Sort Order Toggler */}
        <button
          onClick={toggleSortOrder}
          title={`Sort ${filters.order === 'desc' ? 'Descending' : 'Ascending'}`}
          className="rounded-sm border border-ledger-border p-2 hover:bg-ledger-surface/60 text-ledger-ink transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
        >
          {filters.order === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
        </button>

      </div>
    </div>
  );
};

export default FilterBar;
