import React from 'react';

export interface ToastData {
  id: number;
  message: string;
  icon?: string;
  type?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform animate-bounce-short"
        >
          <span className="material-symbols-outlined text-[20px] text-primary-fixed">
            {toast.icon || 'check_circle'}
          </span>
          <span className="font-label-md text-label-md font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-inverse-on-surface/70 hover:text-inverse-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
