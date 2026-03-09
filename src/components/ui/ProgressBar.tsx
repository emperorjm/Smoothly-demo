interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="h-3 bg-surface-light rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-gradient-to-r from-coral to-purple rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-text-secondary">{value} likes</span>
        <span className="text-text-muted">{max} needed</span>
      </div>
    </div>
  );
}
