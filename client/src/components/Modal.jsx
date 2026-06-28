import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal overlay component that supports slide/scale transitions, 
 * click outside to close, ESC key handling, and body scroll lock.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Visual state
 * @param {function} props.onClose - Action to dismiss the modal
 * @param {string} [props.title] - Optional title for the header
 * @param {React.ReactNode} props.children - Modal content body
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent page scroll when modal is open and handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[#15201C]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-sm bg-ledger-surface p-6 shadow-xl border border-ledger-border animate-scale-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ledger-border pb-4">
          <h3 className="font-display text-lg font-bold text-ledger-ink">
            {title || 'Dialog'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 text-ledger-ink/40 hover:bg-ledger-bg hover:text-ledger-ink transition-colors duration-200 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 text-sm text-ledger-ink/80 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
