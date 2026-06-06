import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform">
                🏃
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-wider text-white">AAH</span>
                <span className="text-xs text-gray-400">Athletics Indore</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering youth through athletics since the 1980s. 🐖 Eat like a pig, 🐆 Run like a jaguar!
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/_indore_corporation_athletics?igsh=NzZjMzkxbDV2ZWN1" className="w-10 h-10 rounded-full bg-dark-800 hover:bg-primary text-gray-400 hover:text-white transition-all flex items-center justify-center" target='_blank'>
                <FiInstagram />
              </a>
              <a href="https://x.com/indorecorporation?t=c7k1tPjzJnUy5L9I3_mQfA&s=09" className="w-10 h-10 rounded-full bg-dark-800 hover:bg-primary text-gray-400 hover:text-white transition-all flex items-center justify-center" target='_blank'>
                <FiTwitter />
              </a>
              <a href="https://www.facebook.com/IndoreCorporationAthleticsAssociation?mibextid=ZbWKwL" className="w-10 h-10 rounded-full bg-dark-800 hover:bg-primary text-gray-400 hover:text-white transition-all flex items-center justify-center" target='_blank'>
                <FiFacebook />
              </a>
              <a href="https://m.youtube.com/%40IndorecorporationAthletics?fbclid=PAb21jcARNuyZleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAacDt7yFsv-ATk5k7tdvBbrnYv9EuQVUheUK9iH8aAZlHQWDlia8B0lOiGhPtg_aem_LOfkGCiGLHlXX8rcgZKKzA" className="w-10 h-10 rounded-full bg-dark-800 hover:bg-primary text-gray-400 hover:text-white transition-all flex items-center justify-center" target='_blank'>
                <FiYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-primary transition-colors">Join AAH</Link></li>
              <li><a href="/#about" className="text-gray-400 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/#programs" className="text-gray-400 hover:text-primary transition-colors">Training Programs</a></li>
            </ul>
          </div>

          {/* Training Locations */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Training Centers</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary mt-1 flex-shrink-0 text-lg" />
                <span className="text-gray-400 text-sm"><strong>Malhar Ashram</strong><br/>Group training sessions</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <p className="text-gray-400 text-sm mb-4">Get in touch with our team for more information about AAH.</p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">+91-7771007505</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">icaaa@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Arambh Atheletics Hub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/login" className="text-gray-500 hover:text-white transition-colors">Admin Login</Link>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
