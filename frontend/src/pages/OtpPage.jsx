import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiLock, FiAlertCircle } from 'react-icons/fi';
import AlertBox from '../components/AlertBox';

const OtpPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { uid } = location.state || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!uid) {
            setError('OTP session expired. Please register again.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/otps/verify', { uid, otp });
            toast.success(res.data.message || 'OTP verified successfully.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
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
                                Enter OTP
                            </h2>
                            <p className="text-content-muted text-sm">Check your email for the OTP</p>
                        </div>

                        {error && (
                            <AlertBox variant="danger" icon={FiAlertCircle} className="mb-6">
                                <span className="text-sm">{error}</span>
                            </AlertBox>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-content-muted text-sm font-medium mb-1" htmlFor="otp">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    className="w-full bg-surface-2 border border-border focus:border-primary outline-none text-content rounded-lg px-4 py-2"
                                />
                            </div>


                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3"
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </>
    )
}

export default OtpPage

