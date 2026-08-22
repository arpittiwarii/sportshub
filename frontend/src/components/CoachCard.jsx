import { motion } from 'framer-motion';
import { FiAward, FiTarget } from 'react-icons/fi';

export default function CoachCard({ name, role, experience, specialty, icon: Icon = FiAward, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="bg-gradient-to-br from-surface to-bg border border-border group-hover:border-primary/40 rounded-2xl p-8 shadow-card group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-300 relative z-10">
        {/* Icon Background */}
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="text-2xl text-primary" />
        </div>

        {/* Content */}
        <h3 className="font-display text-2xl font-bold text-content mb-2">{name}</h3>
        <p className="eyebrow text-primary mb-3">{role}</p>

        <div className="space-y-2 mb-6">
          <p className="text-content-muted flex items-center gap-2">
            <FiTarget className="text-primary" size={16} />
            <span>{experience}</span>
          </p>
          {specialty && (
            <p className="text-content-muted flex items-center gap-2">
              <FiAward className="text-primary" size={16} />
              <span>{specialty}</span>
            </p>
          )}
        </div>

        {/* Hover Border */}
        <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/50 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </motion.div>
  );
}
