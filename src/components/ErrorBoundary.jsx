import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ErrorBoundaryUI({ message, onRetry }) {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed ${
        theme === 'dark'
          ? 'border-red-500/30 bg-red-950/20 text-red-300'
          : 'border-red-300 bg-red-50 text-red-600'
      }`}
    >
      <AlertTriangle className="w-12 h-12 mb-3 opacity-60" />
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-sm opacity-70 mb-4 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors cursor-pointer"
          aria-label="Retry"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
