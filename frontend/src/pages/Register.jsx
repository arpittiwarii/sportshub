import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AlertBox from '../components/AlertBox';
import PasswordInput from '../components/PasswordInput';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
    age: '',
    sport: '',
    contact: '',
    afiId: '',
    schoolName: '',
    aadhar: ''
  });

  // const [birthCertificateFile, setBirthCertificateFile] = useState(null);
  // const [aadharCardFile, setAadharCardFile] = useState(null);

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // const handleBirthCertificateFileChange = (e) => {
  //   const f = e.target.files && e.target.files[0];
  //   if (f) {
  //     const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  //     if (!allowed.includes(f.type)) {
  //       toast.error('Birth Certificate must be PDF, JPG, or PNG.');
  //       setBirthCertificateFile(null);
  //       return;
  //     }
  //   }
  //   setBirthCertificateFile(f || null);
  // };

  // const handleAadharCardFileChange = (e) => {
  //   const f = e.target.files && e.target.files[0];
  //   if (f) {
  //     const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  //     if (!allowed.includes(f.type)) {
  //       toast.error('Aadhar Card must be PDF, JPG, or PNG.');
  //       setAadharCardFile(null);
  //       return;
  //     }
  //   }
  //   setAadharCardFile(f || null);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      if (!formData.afiId || !String(formData.afiId).trim()) {
        toast.error('AFI ID is required.');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmpassword) {
        toast.error('Passwords do not match.');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: Number(formData.age),
        sports: formData.sport,
        contact: formData.contact,
        school: formData.schoolName,
        afiId: formData.afiId,
        aadhar: formData.aadhar
      };

      const res = await api.post('/auth/register', payload);
      const responseData = res.data?.data;
      console.log(res.data)
      console.log(res.data?.data)
      if (res?.data?.data?.success) {
        setStatus({
          type: 'success',
          message: 'OTP sent! Check your email for OTP.',
        });
        toast.success(`OTP successfully sent to ${formData.email}.`);
      }
      setFormData({ name: '', email: '', password: '', confirmpassword: '', age: '', sport: '', contact: '', afiId: '', schoolName: '', aadhar: '' });
      // setBirthCertificateFile(null);
      // setAadharCardFile(null);
      navigate('/otp', { state: { uid: responseData.uid, email: responseData.email } });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      });
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-shell pb-16 bg-bg relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full"></div>

      <div className="container mx-auto px-6 max-w-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="eyebrow text-primary mb-2 block">Admissions Open</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-content mb-4">Join <span className="text-primary">Arambh</span></h1>
          <p className="text-content-muted">Register now. Once approved by the admin, you can log in to your student dashboard.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 md:p-10"
        >
          {status.message && (
            <AlertBox
              variant={status.type === 'success' ? 'success' : 'danger'}
              icon={status.type === 'success' ? FiCheckCircle : FiAlertCircle}
              className="mb-6"
            >
              <p className="font-medium">{status.message}</p>
            </AlertBox>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="name">Full Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="email">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="password">Password*</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                placeholder="••••••••"
              />
              <p className="text-content-muted text-xs mt-1">
                At least 8 characters, including a letter and a number.
              </p>
            </div>

            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="confirmpassword">Confirm Password*</label>
              <PasswordInput
                id="confirmpassword"
                name="confirmpassword"
                value={formData.confirmpassword}
                onBlur={(e)=>{if(e.target.value !== formData.password) toast("Confirm Password must be same as password")}}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-content-muted font-medium mb-2" htmlFor="age">Age*</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="5"
                  max="60"
                  className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block text-content-muted font-medium mb-2" htmlFor="sports">Select Sport</label>
                <div className="flex flex-col gap-2">
                  {/* The Label remains separate from the loop */}

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="sport"
                      id="sports-select"
                      onChange={handleChange}
                      className="col-span-2 bg-surface-2 border border-border rounded-xl px-3 py-2 text-content cursor-pointer hover:border-primary/40 transition-colors appearance-none focus:outline-none focus:border-primary"
                    >
                      {[
                        'Select',
                        'Shot Put',
                        'Long Jump',
                        'High Jump',
                        'Running 100m',
                        'Running 400m',
                        'Running 800m',
                        'Running 1600m',
                        'Other',
                      ].map((s) => (
                        <option key={s} value={s} className="bg-surface text-content">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="contact">Contact Number*</label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                placeholder="9989898989 "
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* <div>
                <label className="block text-content-muted font-medium mb-2" htmlFor="birthCertificate">
                  Birth Certificate Registration Number :
                </label>
                <input
                  type="text"
                  id="birthCertificate"
                  name="birthCertificate"
                  // accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  // onChange={handleBirthCertificateFileChange}
                  // required
                  className="w-full bg-surface-2 border border-border text-content rounded-xl px-4 py-3 transition-colors"
                />
              </div> */}

              <div>
                <label className="block text-content-muted font-medium mb-2" htmlFor="aadharCard">
                  Aadhar Card Number :
                </label>
                <input
                  type="text"
                  id="aadhar"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  // accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  // onChange={handleAadharCardFileChange}
                  // required
                  className="w-full bg-surface-2 border border-border text-content rounded-xl px-4 py-3 transition-colors"
                  placeholder="12 Digit Aadhar No."
                />
              </div>

              <div>
                <label className="block text-content-muted font-medium mb-2" htmlFor="afiId">
                  AFI ID
                </label>
                <input
                  type="text"
                  id="afiId"
                  name="afiId"
                  value={formData.afiId}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                  placeholder="Enter your AFI ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="schoolName">School / College Name</label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
                className="w-full bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-content rounded-xl px-4 py-3 transition-colors"
                placeholder="e.g. ABC School"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-4 flex justify-center items-center"
            >
              {loading ? 'Submitting...' : 'Register as Student'}
            </button>
            <p className="text-center text-sm text-content-muted mt-4">
              Already registered and approved? <Link to="/login" className="text-primary hover:underline">Log in</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div >
  );
};

export default Register;
