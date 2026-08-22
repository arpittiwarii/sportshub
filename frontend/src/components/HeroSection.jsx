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
  backgroundGradient = 'from-dark-900 via-transparent to-transparent'
}) {
  return (
    <section className="theme-hero relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        {backgroundImage && (
          <>
            <div className={`absolute inset-0 bg-dark-900/75 z-10`}></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${backgroundGradient} z-10`}></div>
            <img src={backgroundImage} alt="Athletics" className="w-full h-full object-cover" />
          </>
        )}
      </div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          {badge && (
            <motion.div variants={fadeUpVariant} className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/50">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            {title} 
            {titleHighlight && (
              <span className="text-primary block">
                {titleHighlight}
              </span>
            )}
          </motion.h1>

          {subtitle && (
            <motion.p variants={fadeUpVariant} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              {subtitle}
            </motion.p>
          )}

          <motion.div variants={fadeUpVariant} className="flex flex-wrap gap-4">
            <Link to={ctaLink} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/50">
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
