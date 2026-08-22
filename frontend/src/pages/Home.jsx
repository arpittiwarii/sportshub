import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CoachCard from '../components/CoachCard';
import EventCard from '../components/EventCard';
import TrainingLocationCard from '../components/TrainingLocationCard';
import DashboardCard from '../components/DashboardCard';
import SectionHeader from '../components/SectionHeader';
import { FiUsers, FiTrendingUp, FiMap, FiCalendar, FiAward, FiMapPin, FiClock, FiTarget } from 'react-icons/fi';
import hero_background from "../assets/hero_background.png";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const activities = [
  { icon: FiTarget, title: 'Sprint Training', desc: 'Explosive starts, acceleration mechanics, and speed endurance drills tailored for 100m/400m events.' },
  { icon: FiClock, title: 'Endurance Training', desc: 'Aerobic base building, tempo runs, and recovery coaching to help you perform consistently across longer races.' },
  { icon: FiTrendingUp, title: 'Strength & Conditioning', desc: 'Functional strength, injury-prevention mobility, and performance-focused conditioning under expert guidance.' },
  { icon: FiAward, title: 'Jump Training', desc: 'Vertical power, take-off technique, and coordination drills designed for long jump and high jump development.' },
];

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <HeroSection
        badge="ESTABLISHED 2026"
        title="Arambh Athletics Hub"
        titleHighlight="Indore"
        subtitle="Empowering youth through athletics — train with intent, compete with heart."
        ctaText="Join Our Programs"
        ctaLink="/register"
        secondaryCtaText="Explore More"
        secondaryCtaLink="#about"
        backgroundImage={hero_background}
      />

      {/* ==================== STATS SECTION ==================== */}
      <section className="py-16 bg-surface border-y border-border relative z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { label: "Athletes", value: "500+", icon: FiUsers },
              { label: "Years Active", value: "18+", icon: FiTrendingUp },
              { label: "Coaches", value: "3+", icon: FiAward },
              { label: "Locations", value: "1", icon: FiMap }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUpVariant}
                className="bg-bg border border-border hover:border-primary/40 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-card transition-all duration-300 hover:shadow-primary/20"
              >
                <stat.icon className="text-2xl md:text-3xl text-primary mb-3" />
                <h3 className="text-3xl md:text-4xl font-display font-bold text-content mb-1 tabular-nums">{stat.value}</h3>
                <p className="text-content-muted font-medium text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== ABOUT SECTION ==================== */}
      <section id="about" className="py-24 bg-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-full">
              <SectionHeader
                badge="OUR LEGACY"
                title="About AAH"
                description="Founded in 2026 in the heart of Indore"
                centered={true}
                highlightWords={["AAH"]}
              />

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6 mt-12"
              >
                <motion.div variants={fadeUpVariant} className="card p-6">
                  <h3 className="text-2xl font-bold text-content mb-3 flex items-center justify-center gap-3">
                    <span className="text-3xl">🏛️</span> Founder
                  </h3>
                  <p className="text-content-muted">Coach Rhythm Singh Sikarwar founded AAH with a vision to develop athletic talent in Indore.</p>
                </motion.div>

                <motion.div variants={fadeUpVariant} className="card p-6">
                  <h3 className="text-2xl font-bold text-content mb-3 flex items-center justify-center gap-3">
                    <span className="text-3xl">📍</span> Vision
                  </h3>
                  <p className="text-content-muted">Empowering youth through athletics and building a community of champions who excel in sports and life.</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== COACHES SECTION ==================== */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="EXPERIENCED LEADERSHIP"
            title="Meet Our Coaches"
            description="Experienced professionals dedicated to developing athletic excellence"
            highlightWords={["Coaches"]}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            <CoachCard
              index={1}
              name="Rhythm Singh"
              role="FOUNDER"
              experience="5+ years in athlete development"
              specialty="Strength & Conditioning"
              icon={FiTrendingUp}
            />
            <CoachCard
              index={1}
              name="Aryan Slathia"
              role="Assistant Coach"
              experience="5+ years in athlete development"
              specialty="Strength & Conditioning"
              icon={FiTrendingUp}
            />
          </motion.div>
        </div>
      </section>

      {/* ==================== TRAINING LOCATIONS ==================== */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="TRAINING CENTERS"
            title="Our Training Locations"
            description="State-of-the-art facilities across Indore"
            highlightWords={["Locations"]}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-1 gap-10"
          >
            <TrainingLocationCard
              index={1}
              name="Malhar Ashram"
              description="Secondary training center perfect for group sessions and specialized conditioning programs."
              timing="6:00 AM - 7:00 PM"
              capacity="150+ athletes"
              icon={FiMapPin}
            />
          </motion.div>
        </div>
      </section>

      {/* ==================== ACTIVITIES SECTION ==================== */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="MEMBER ACTIVITIES"
            title="What We Offer"
            description="Structured training programs designed for every event and goal"
            highlightWords={["Offer"]}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 w-fit mx-auto"
          >
            {activities.map((a, i) => (
              <motion.div
                key={i}
                variants={fadeUpVariant}
                className={`bg-gradient-to-br from-bg to-surface border border-border hover:border-primary/40 rounded-2xl p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group ${i === 3 ? 'md:col-start-2' : ''}`}
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl">
                  <a.icon />
                </div>
                <h3 className="text-2xl font-bold text-content mb-3">{a.title}</h3>
                <p className="text-content-muted">{a.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== CALL TO ACTION SECTION ==================== */}
      <section className="relative py-32 bg-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-primary/15 opacity-60"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-content mb-6 leading-tight">
            Start Your Athletic <span className="text-primary">Journey Today</span>
          </h2>
          <p className="text-lg text-content-muted mb-10 max-w-2xl mx-auto">
            Join AAH and train like a champion. Whether you're a beginner or an advanced athlete, we have programs tailored for you.
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.div variants={fadeUpVariant}>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 hover:scale-105 transition-transform">
                Join Now <span className="text-xl">→</span>
              </Link>
            </motion.div>
            <motion.div variants={fadeUpVariant}>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2 hover:scale-105 transition-transform">
                Member Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== EVENTS SECTION ==================== */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="MAJOR EVENTS"
            title="Featured Events"
            description="Celebrating athletic excellence through premier competitions"
            highlightWords={["Events"]}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8 items-stretch"
          >
            <EventCard
              index={0}
              title="Dada Memorial Athletics Championship"
              description="Annual championship honoring the legacy of athletics in the region. Attracts top athletes from across the state."
              date="Held Annually"
              location="Nehru Stadium, Indore"
              icon={FiCalendar}
            />
            <EventCard
              index={1}
              title="Run for Health India"
              description="Community-driven marathon event promoting health awareness and fitness. Open to all age groups."
              date="Every Season"
              location="Chiman Bagh & Surrounding Areas"
              icon={FiCalendar}
            />
          </motion.div>
        </div>
      </section>

      {/* ==================== PROGRAMS DASHBOARD ==================== */}
      <section className="py-24 bg-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="MEMBER BENEFITS"
            title="Why Join AAH?"
            description="Comprehensive programs and support for your athletic journey"
            highlightWords={["Join"]}
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-6"
          >
            <DashboardCard
              index={0}
              title="Expert Guidance"
              value="45+ Yrs"
              subtitle="Head coach experience"
              icon={FiAward}
              tone="primary"
            />
            <DashboardCard
              index={1}
              title="Active Community"
              value="500+"
              subtitle="Athletes in training"
              icon={FiUsers}
              tone="success"
            />
            <DashboardCard
              index={2}
              title="Multiple Venues"
              value="1"
              subtitle="Training location"
              icon={FiMapPin}
              tone="steel"
            />
            <DashboardCard
              index={3}
              title="Proven Results"
              value="100+"
              subtitle="Champions developed"
              icon={FiTrendingUp}
              tone="primary"
            />
          </motion.div>
        </div>
      </section>

      {/* ==================== FINAL CTA SECTION ==================== */}
      <section className="py-24 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-primary-contrast mb-6"
          >
            Ready to Take Your Game to the Next Level?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-primary-contrast/80 text-xl max-w-2xl mx-auto mb-10"
          >
            Join hundreds of athletes who have already transformed their skills with AAH.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/register" className="bg-bg hover:bg-surface text-content font-semibold py-4 px-10 rounded-full text-lg shadow-2xl transition-transform hover:scale-105 inline-block uppercase tracking-wide">
              Register Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
