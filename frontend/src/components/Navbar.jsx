import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import logo from "../assets/logo.jpg";
import { useTheme } from '../context/theme-context';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Publish the real navbar height as --navbar-h so pages can pad past it
  // (see .page-shell in index.css). Only the expanded state is measured:
  // padding has to clear the tallest navbar, and rewriting the value while
  // the user scrolls would shift the page under them.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const publishHeight = () => {
      if (window.scrollY > 50) return;
      document.documentElement.style.setProperty('--navbar-h', `${el.offsetHeight}px`);
    };

    publishHeight();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const userStr = localStorage.getItem('user');
  let role = null;
  if (userStr) {
    try { role = JSON.parse(userStr).role; } catch (e) { /* ignore malformed user */ }
  }

  const renderNavLinks = () => {
    return (
      <>
        <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/blogs" className={`nav-link ${location.pathname === '/blogs' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Blogs</Link>

        {role === 'ADMIN' && (
          <>
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/payments" className={`nav-link ${location.pathname === '/admin/payments' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Payments</Link>
          </>
        )}

        {role === 'ATHLETE' && (
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'text-primary' : ''}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
        )}
      </>
    );
  };

  return (
    <header
      ref={headerRef}
      className={`app-navbar fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b ${
        isScrolled
          ? 'bg-bg/95 border-border py-3 shadow-lg'
          : 'bg-bg/90 border-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-border">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-2xl tracking-wide text-content">Arambh</span>
            <span className="text-[0.65rem] text-content-muted font-semibold uppercase tracking-[0.18em]">Athletics Hub Indore</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
          {renderNavLinks()}

          {!role && (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-content-muted hover:text-primary font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-hover text-primary-contrast font-bold py-2.5 px-6 rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/30 uppercase tracking-wide text-sm"
              >
                Join Now
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        </nav>
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden absolute top-full left-0 w-full z-40"
        >
          <div className="bg-bg border-b border-primary/20 p-4 sm:p-6 flex flex-col gap-4 shadow-2xl">
            {renderNavLinks()}

            {!role ? (
              <div className="flex flex-col gap-3 mt-2 border-t border-border pt-4">
                <Link
                  to="/login"
                  className="text-content font-semibold text-lg hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-contrast font-bold py-2.5 px-6 rounded-lg text-center hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 uppercase tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2 border-t border-border pt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setMobileMenuOpen(false);
                    window.location.href = '/';
                  }}
                  className="text-danger font-semibold text-lg hover:text-danger/80 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="theme-toggle theme-toggle-mobile"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
              Use {theme === 'dark' ? 'light' : 'dark'} mode
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="lg:hidden text-content text-2xl focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
