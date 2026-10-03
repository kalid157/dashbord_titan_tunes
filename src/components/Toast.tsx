import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-gray-800',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-white/10`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white font-bold text-xs cursor-pointer p-0.5"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
