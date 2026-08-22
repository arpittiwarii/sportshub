// Small icon container used across cards and rows.
const TONE = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  danger:  'bg-danger/10 text-danger',
  steel:   'bg-steel/10 text-steel',
  solid:   'bg-primary text-primary-contrast shadow-lg shadow-primary/30',
};

const SIZES = {
  sm: 'w-9 h-9 rounded-lg',
  md: 'w-12 h-12 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
};

export default function IconChip({ icon: Icon, tone = 'primary', size = 'md', className = '' }) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0
        ${SIZES[size] || SIZES.md} ${TONE[tone] || TONE.primary} ${className}`}
    >
      {Icon && <Icon size={iconSize} />}
    </span>
  );
}
