import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

export default function HeroSection({
  badge,
  title,
  titleHighlight,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage,
  backgroundGradient = 'from-[#0A1424] via-[#0A1424]/40 to-transparent'
}) {
  return (
    <section className="theme-hero relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        {backgroundImage && (
          <>
            {/* Fixed navy scrim — stays dark in BOTH themes so light hero type is always readable */}
            <div className="absolute inset-0 bg-[#0A1424]/80 z-10"></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${backgroundGradient} z-10`}></div>
            <img src={backgroundImage} alt="Athletics" className="w-full h-full object-cover" />
          </>
        )}
      </div>

      {/* Signature: track "lane lines" — angled gold hairlines behind the headline */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[11] pointer-events-none opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, transparent 0 38px, rgb(201 162 75 / 0.6) 38px 40px)',
          WebkitMaskImage:
            'radial-gradient(ellipse 65% 60% at 28% 42%, black, transparent 72%)',
          maskImage:
            'radial-gradient(ellipse 65% 60% at 28% 42%, black, transparent 72%)',
        }}
      ></div>

      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          {badge && (
            <motion.div variants={fadeUpVariant} className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-primary-contrast px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/40">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h1 variants={fadeUpVariant} className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6">
            {title}
            {titleHighlight && (
              <span className="text-primary block">
                {titleHighlight}
              </span>
            )}
          </motion.h1>

          {subtitle && (
            <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed">
              {subtitle}
            </motion.p>
          )}

          <motion.div variants={fadeUpVariant} className="flex flex-wrap gap-4">
            <Link to={ctaLink} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/40">
              {ctaText} <span className="text-xl">→</span>
            </Link>
            {secondaryCtaText && (
              <Link to={secondaryCtaLink} className="btn-secondary">
                {secondaryCtaText}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
