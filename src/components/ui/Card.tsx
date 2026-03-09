interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = "", glow }: CardProps) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-2xl p-6
        backdrop-blur-sm
        ${glow ? "shadow-[0_0_60px_rgba(124,92,252,0.08)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
