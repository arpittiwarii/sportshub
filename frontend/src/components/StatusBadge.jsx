import { FiCheckCircle, FiClock, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

// Single source of truth for payment/fee status pills.
// Accepts any casing (backend returns UPPERCASE) and normalizes it, which also
// fixes prior lowercase comparisons that never matched.
const STATUS_CONFIG = {
  APPROVED: { icon: FiCheckCircle, tone: 'success', label: 'Approved' },
  PENDING:  { icon: FiClock,       tone: 'primary', label: 'Pending' },
  REJECTED: { icon: FiXCircle,     tone: 'danger',  label: 'Rejected' },
  UNPAID:   { icon: FiAlertTriangle, tone: 'danger', label: 'Unpaid' },
  DEFAULTER:{ icon: FiAlertTriangle, tone: 'danger', label: 'Defaulter' },
};

const TONE = {
  success: 'bg-success/10 border-success/30 text-success',
  primary: 'bg-primary/10 border-primary/30 text-primary',
  danger:  'bg-danger/10 border-danger/30 text-danger',
  steel:   'bg-steel/10 border-steel/30 text-steel',
};

const StatusBadge = ({ status, label }) => {
  const key = String(status || '').toUpperCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
        font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105
        ${TONE[config.tone]}`}
    >
      <Icon className="w-4 h-4" />
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
