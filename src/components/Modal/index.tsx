'use client';

import { useCallback, useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full bg-dark/80 backdrop-blur-sm backdrop:bg-transparent p-0"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-full w-full p-5 md:p-8">
        <div className="relative bg-card rounded-card-lg shadow-card-hover max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-dark text-h4 transition-colors cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </dialog>
  );
}
