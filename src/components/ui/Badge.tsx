interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "coral" | "muted";
  className?: string;
}

export function Badge({ children, variant = "gold", className = "" }: BadgeProps) {
  const styles = {
    gold: "bg-gradient-to-r from-gold to-gold-dark text-black font-bold",
    coral: "bg-gradient-to-r from-coral to-purple text-white font-semibold",
    muted: "bg-surface-light text-text-secondary border border-border",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full text-sm tracking-wide
        ${styles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
