interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: "text" | "number";
  mono?: boolean;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
  type = "text",
  mono,
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs uppercase tracking-[0.15em] text-text-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full bg-surface-light border border-border rounded-xl px-4 py-3
          text-sm text-foreground placeholder:text-text-muted/50
          focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${mono ? "font-mono" : ""}
        `}
      />
    </div>
  );
}
