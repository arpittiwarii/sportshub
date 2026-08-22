import { motion } from 'framer-motion';

// Standard surface card shell. Consolidates the inline
// "bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 …" pattern.
export default function Card({
  as: Tag = 'div',
  hover = true,
  glow = false,
  className = '',
  children,
  ...props
}) {
  const base =
    'relative bg-gradient-to-br from-surface to-bg border border-border rounded-2xl shadow-card';
  const hoverCls = hover
    ? 'transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20'
    : '';

  return (
    <Tag className={`${base} ${hoverCls} ${className}`} {...props}>
      {glow && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/5 blur-xl opacity-0 hover:opacity-100 transition-opacity" />
      )}
      {children}
    </Tag>
  );
}

// Motion-enabled variant for scroll-reveal grids.
export function MotionCard({ index = 0, className = '', children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`relative bg-gradient-to-br from-surface to-bg border border-border rounded-2xl shadow-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
