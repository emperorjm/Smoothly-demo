"use client";

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "gold";
}

export function GradientButton({
  children,
  onClick,
  disabled,
  className = "",
  variant = "primary",
}: GradientButtonProps) {
  const gradients = {
    primary: "from-coral to-purple",
    gold: "from-gold to-gold-dark",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group overflow-hidden rounded-xl px-8 py-4
        font-semibold text-white text-lg tracking-wide
        bg-gradient-to-r ${gradients[variant]}
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,107,107,0.3)]
        active:scale-[0.98]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      <div
        className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-r from-coral-light to-purple-light
          transition-opacity duration-300
        "
      />
    </button>
  );
}
