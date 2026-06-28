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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/80 animate-scale-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <h3 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
            {title || 'Dialog'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
