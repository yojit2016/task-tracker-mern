import React from 'react';

/**
 * Individual skeleton card representation.
 */
const SkeletonCard = () => {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#111827] animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div className="h-5 w-1/2 rounded-md bg-slate-200 dark:bg-slate-800" />
        {/* Status Badge */}
        <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Description lines */}
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Footer bar */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        {/* Due Date & Priority */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid loading loader that mimics the TaskCard layout.
 * 
 * @param {object} props
 * @param {number} [props.count=6] - Number of cards to render
 */
const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
