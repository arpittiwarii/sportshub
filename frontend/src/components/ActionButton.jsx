// Unified action button for tables/rows. Replaces the scattered
// bg-{blue|green|red}-500/10 text-{color}-400 border-{color}-500/30 buttons.
const VARIANTS = {
  view:    'bg-steel/10 text-steel border-steel/30 hover:bg-steel/20',
  upload:  'bg-steel/10 text-steel border-steel/30 hover:bg-steel/20',
  approve: 'bg-success/10 text-success border-success/30 hover:bg-success/20',
  reject:  'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20',
  neutral: 'bg-surface-2 text-content-muted border-border hover:bg-surface-2/70',
};

export default function ActionButton({
  variant = 'neutral',
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border
        text-xs font-semibold transition-all duration-300 hover:scale-105
        focus-visible:outline-none ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
