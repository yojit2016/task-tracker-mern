import React from 'react';

/**
 * Individual skeleton card representation.
 */
const SkeletonCard = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 bg-ledger-surface border-b border-ledger-border last:border-b-0 animate-pulse">
      {/* Title & Description */}
      <div className="flex-1 min-w-0 pr-4 flex items-start gap-3">
        <div className="h-5 w-5 bg-ledger-border rounded-xs mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-4 w-1/3 rounded-sm bg-ledger-border" />
          <div className="h-3 w-3/4 rounded-sm bg-ledger-border" />
        </div>
      </div>

      {/* Meta & Actions */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-6 pl-8 md:pl-0">
        <div className="h-4 w-24 rounded-sm bg-ledger-border" />
        <div className="h-4.5 w-12 rounded-sm bg-ledger-border" />
        <div className="h-6 w-20 rounded-sm bg-ledger-border" />
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-sm bg-ledger-border" />
          <div className="h-7 w-7 rounded-sm bg-ledger-border" />
        </div>
      </div>
    </div>
  );
};

/**
 * Ruled row loading loader that mimics the TaskCard layout.
 * 
 * @param {object} props
 * @param {number} [props.count=6] - Number of cards to render
 */
const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="flex flex-col border border-ledger-border divide-y divide-ledger-border bg-ledger-surface rounded-sm">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
