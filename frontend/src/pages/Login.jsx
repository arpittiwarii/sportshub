import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLock, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AlertBox from '../components/AlertBox';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const responseData = res.data?.data;
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify({
        id: responseData.user.id,
        name: responseData.user.name,
        role: responseData.user.role,
      }));
      if (res.data?.success) {
        toast.success('Successfully logged in!');
      }

      if (responseData.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response.data.message || 'Invalid credentials. Please try again.');
      } else if (err.response?.status === 403) {
        setError(err.response.data.message || 'Access denied');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Server connection failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="text-primary text-2xl" />
            </div>
            <h2 className="text-2xl font-display font-bold text-content mb-2">
              Login
            </h2>
            <p className="text-content-muted text-sm">Sign in to your account</p>
          </div>

          {error && (
            <AlertBox variant="danger" icon={FiAlertCircle} className="mb-6">
              <span className="text-sm">{error}</span>
            </AlertBox>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-content-muted text-sm font-medium mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-2 border border-border focus:border-primary outline-none text-content rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-content-muted text-sm font-medium" htmlFor="password">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-surface-2 border border-border focus:border-primary outline-none text-content rounded-lg px-4 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
