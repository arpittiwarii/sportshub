// Inline alert / info box. Replaces the ~6 hand-rolled
// bg-{green|red|blue}-500/10 boxes across auth pages and dashboards.
const VARIANTS = {
  success: 'bg-success/10 border-success/30 text-success',
  danger:  'bg-danger/10 border-danger/30 text-danger',
  info:    'bg-steel/10 border-steel/30 text-steel',
  primary: 'bg-primary/10 border-primary/30 text-primary',
};

export default function AlertBox({ variant = 'info', icon: Icon, children, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm
        ${VARIANTS[variant] || VARIANTS.info} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
