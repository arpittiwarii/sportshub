import { motion } from 'framer-motion';
import LaneRule from './LaneRule';

export default function SectionHeader({
  badge,
  title,
  description,
  centered = true,
  highlightWords = []
}) {
  const words = title.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`${centered ? 'text-center' : ''} mb-12`}
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`flex mb-4 ${centered ? 'justify-center' : ''}`}
        >
          <span className="eyebrow bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
            {badge}
          </span>
        </motion.div>
      )}

      <h2 className="font-display text-4xl md:text-5xl font-bold text-content mb-4 leading-tight">
        {words.map((word, i) => (
          <span key={i} className={highlightWords.includes(word) ? 'text-primary' : ''}>
            {word}{' '}
          </span>
        ))}
      </h2>

      {/* Signature: track lane-line accent under the heading */}
      <LaneRule lanes={4} className={`w-16 my-5 ${centered ? 'mx-auto' : ''}`} />

      {description && (
        <p className="text-content-muted text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
