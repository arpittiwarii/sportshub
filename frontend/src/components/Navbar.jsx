import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userStr = localStorage.getItem('user');
  let role = null;
  if (userStr) {
    try { role = JSON.parse(userStr).role; } catch (e) { }
  }

  const renderNavLinks = () => {
    return (
      <>
        <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/blogs" className={`nav-link ${location.pathname === '/blogs' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Blogs</Link>

        {role === 'admin' && (
          <>
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/payments" className={`nav-link ${location.pathname === '/admin/payments' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Payments</Link>
            
          </>
        )}

        {role === 'athlete' && (
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
        )}
      </>
    );
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-900/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-16 h-16">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-wider text-white leading-tight">Arambh</span>
            <span className="text-xs text-gray-400 font-semibold uppercase">Athletics Hub Indore</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
          {renderNavLinks()}

          {!role && (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-400 hover:text-primary font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:brightness-110 text-black font-bold py-2.5 px-6 rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/50"
              >
                Join Now
              </Link>
            </div>
          )}
        </nav>
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden absolute top-full left-0 w-full z-40"
        >
          <div className="bg-dark-900 border-b border-primary/20 p-4 sm:p-6 flex flex-col gap-4 shadow-2xl">
            {renderNavLinks()}

            {!role ? (
              <div className="flex flex-col gap-3 mt-2 border-t border-dark-700 pt-4">
                <Link
                  to="/login"
                  className="text-white font-semibold text-lg hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-black font-bold py-2.5 px-6 rounded-lg text-center hover:brightness-110 transition-all shadow-lg shadow-primary/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2 border-t border-dark-700 pt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setMobileMenuOpen(false);
                    window.location.href = '/';
                  }}
                  className="text-red-500 font-semibold text-lg hover:text-red-400 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="lg:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
