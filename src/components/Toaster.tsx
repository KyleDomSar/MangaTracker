import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useToastStore } from '../store/toastStore';
import type { ToastType } from '../store/toastStore';

const TOAST_ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} className="text-green-400" />,
  info: <Info size={16} className="text-blue-400" />,
  error: <AlertCircle size={16} className="text-red-400" />,
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="animate-slideUp pointer-events-auto flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#1a1a24] border border-gray-800 shadow-xl shadow-black/40"
        >
          {TOAST_ICONS[toast.type]}
          <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
