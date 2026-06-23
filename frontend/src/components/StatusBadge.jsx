import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    APPROVED: {
      icon: FiCheckCircle,
      bg: 'bg-accent-green/10',
      border: 'border-accent-green/30',
      text: 'text-accent-green',
      label: 'Approved'
    },
    PENDING: {
      icon: FiClock,
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      text: 'text-primary',
      label: 'Pending'
    },
    REJECTED: {
      icon: FiXCircle,
      bg: 'bg-accent-red/10',
      border: 'border-accent-red/30',
      text: 'text-accent-red',
      label: 'Rejected'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        font-medium text-sm transition-all duration-300
        ${config.bg} border ${config.border} ${config.text}
        hover:shadow-lg hover:scale-105
      `}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
