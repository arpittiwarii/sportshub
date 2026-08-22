import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import logo from '../assets/logo.png'

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 group mb-6">
               <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-border">
                  <img src={logo} alt="logo" className="w-full h-full object-contain" />
                </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-wide text-content">Aarambh</span>
                <span className="text-xs text-content-muted uppercase tracking-[0.15em]">Athletics Hub</span>
              </div>
            </Link>
            <p className="text-content-muted mb-6 leading-relaxed">
              Empowering youth through athletics in Indore — building champions on and off the track.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/_indore_corporation_athletics?igsh=NzZjMzkxbDV2ZWN1" className="w-10 h-10 rounded-full bg-surface-2 hover:bg-primary text-content-muted hover:text-primary-contrast transition-all flex items-center justify-center" target='_blank'>
                <FiInstagram />
              </a>
              <a href="https://x.com/indorecorporation?t=c7k1tPjzJnUy5L9I3_mQfA&s=09" className="w-10 h-10 rounded-full bg-surface-2 hover:bg-primary text-content-muted hover:text-primary-contrast transition-all flex items-center justify-center" target='_blank'>
                <FiTwitter />
              </a>
              <a href="https://www.facebook.com/IndoreCorporationAthleticsAssociation?mibextid=ZbWKwL" className="w-10 h-10 rounded-full bg-surface-2 hover:bg-primary text-content-muted hover:text-primary-contrast transition-all flex items-center justify-center" target='_blank'>
                <FiFacebook />
              </a>
              <a href="https://m.youtube.com/%40IndorecorporationAthletics?fbclid=PAb21jcARNuyZleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAacDt7yFsv-ATk5k7tdvBbrnYv9EuQVUheUK9iH8aAZlHQWDlia8B0lOiGhPtg_aem_LOfkGCiGLHlXX8rcgZKKzA" className="w-10 h-10 rounded-full bg-surface-2 hover:bg-primary text-content-muted hover:text-primary-contrast transition-all flex items-center justify-center" target='_blank'>
                <FiYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-content mb-6">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/" className="text-content-muted hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/register" className="text-content-muted hover:text-primary transition-colors">Join AAH</Link></li>
              <li><a href="/#about" className="text-content-muted hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/#programs" className="text-content-muted hover:text-primary transition-colors">Training Programs</a></li>
            </ul>
          </div>

          {/* Training Locations */}
          <div>
            <h4 className="font-display text-lg font-bold text-content mb-6">Training Centers</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary mt-1 flex-shrink-0 text-lg" />
                <span className="text-content-muted text-sm"><strong className="text-content">Malhar Ashram</strong><br/>Group training sessions</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold text-content mb-6">Contact Us</h4>
            <p className="text-content-muted text-sm mb-4">Get in touch with our team for more information about AAH.</p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary flex-shrink-0" />
                <span className="text-content-muted text-sm">+91-7771007505</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary flex-shrink-0" />
                <span className="text-content-muted text-sm">icaaa@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-content-subtle text-sm">
            © {new Date().getFullYear()} Aarambh Athletics Hub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/login" className="text-content-subtle hover:text-content transition-colors">Admin Login</Link>
            <a href="#" className="text-content-subtle hover:text-content transition-colors">Privacy Policy</a>
            <a href="#" className="text-content-subtle hover:text-content transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
