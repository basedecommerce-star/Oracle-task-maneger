"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showLabel?: boolean;
  colorClass?: string;
}

export function ProgressBar({
  current,
  total,
  className = "",
  showLabel = true,
  colorClass,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const barColor =
    colorClass ||
    (percentage >= 80
      ? "bg-green-500"
      : percentage >= 50
        ? "bg-yellow-500"
        : "bg-tg-button");

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-tg-hint mb-1">
          <span>
            {current} / {total}
          </span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-tg-secondary-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
