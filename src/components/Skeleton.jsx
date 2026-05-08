import { useTheme } from '../context/ThemeContext';

export function Skeleton({ className = '', variant = 'rect' }) {
  const { theme } = useTheme();
  const base = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200';

  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`skeleton ${base} ${variants[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-40 w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="p-4">
      <Skeleton className="h-64 md:h-80 w-full rounded-xl" />
      <div className="flex gap-4 mt-4">
        <Skeleton className="h-20 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}
