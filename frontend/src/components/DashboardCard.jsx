import { motion } from 'framer-motion';
import IconChip from './IconChip';

// Canonical dashboard stat tile. Token-driven `tone` replaces the old
// free-form `gradient` prop (which mixed brand tokens with Tailwind
// default rainbow scales).
export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'primary',
  trends = null,
  index = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <div className="bg-gradient-to-br from-surface to-bg border border-border group-hover:border-primary/50 rounded-2xl p-6 shadow-card group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="text-content-muted text-sm font-medium">{title}</p>
            <p className="text-2xl md:text-3xl font-display font-bold text-content mt-1 tabular-nums">{value}</p>
          </div>
          {Icon && (
            <IconChip
              icon={Icon}
              tone={tone}
              className="group-hover:scale-110 transition-transform duration-300"
            />
          )}
        </div>

        {subtitle && <p className="text-content-subtle text-sm">{subtitle}</p>}

        {trends && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <span className={`text-sm font-semibold ${trends.positive ? 'text-success' : 'text-danger'}`}>
              {trends.positive ? '↑' : '↓'} {trends.value}
            </span>
            <span className="text-content-subtle text-xs">{trends.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
