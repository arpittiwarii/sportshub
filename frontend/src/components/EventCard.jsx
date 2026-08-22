import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin } from 'react-icons/fi';

export default function EventCard({
  title,
  description,
  date,
  location,
  icon: Icon,
  index = 0,
  prominent = false
}) {

  const iconSize = prominent ? 'w-20 h-20' : 'w-14 h-14';
  const textSize = prominent ? 'text-3xl' : 'text-xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative h-full ${prominent ? 'md:col-span-2' : ''}`}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Card */}
      <div className={`relative z-10 h-full flex flex-col justify-between bg-gradient-to-br from-surface to-bg border border-border group-hover:border-primary/50 rounded-2xl p-8 shadow-card group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-300 ${prominent ? 'lg:p-12' : ''}`}>

        {/* Top Section */}
        <div>
          {/* Icon */}
          <div className={`mb-6 ${iconSize}`}>
            <div className={`${iconSize} bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              {Icon && <Icon className={`text-primary ${prominent ? 'text-4xl' : 'text-2xl'}`} />}
            </div>
          </div>

          {/* Title */}
          <h3 className={`font-display font-bold text-content mb-3 ${textSize}`}>
            {title}
          </h3>

          {/* Description */}
          <p className={`text-content-muted flex-grow leading-relaxed ${prominent ? 'text-base' : 'text-sm'}`}>
            {description}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-border space-y-2">
          {date && (
            <p className="text-content-muted flex items-center gap-2 text-sm">
              <FiCalendar className="text-primary" size={16} />
              {date}
            </p>
          )}
          {location && (
            <p className="text-content-muted flex items-center gap-2 text-sm">
              <FiMapPin className="text-primary" size={16} />
              {location}
            </p>
          )}
        </div>

        {/* Border Hover */}
        <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none"></div>
      </div>
    </motion.div>
  );
}
