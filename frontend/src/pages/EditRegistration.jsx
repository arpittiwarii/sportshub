import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const EditRegistration = () => {
  const allowedSports = [
    'Shot Put',
    'Long Jump',
    'High Jump',
    'Running 100m',
    'Running 400m',
    'Running 800m',
    'Running 1600m',
    'Other',
  ];

  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docs, setDocs] = useState({
    birthCertificate: null,
    aadharCard: null,
    afiId: '',
  });
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr)._id : null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      try {
        const res = await api.get(`/athletes/${userId}`);
        const rawSport = res.data?.sport;
        const sportValue = Array.isArray(rawSport) ? rawSport[0] : rawSport;
        const normalizedSport =
          typeof sportValue === 'string' && allowedSports.includes(sportValue) ? sportValue : 'Other';
        setFormData({ ...res.data, sport: normalizedSport });
        setDocs((prev) => ({ ...prev, afiId: res.data?.afiId || '' }));
      } catch (error) {
        toast.error('Failed to load profile. Please try again.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      await api.put(`/athletes/${userId}`, formData);
      setStatus({ 
        type: 'success', 
        message: 'Profile updated successfully!'
      });
      toast.success('Profile updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Update failed. Please try again.' 
      });
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDocs((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setDocs((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAfiIdChange = (e) => {
    setDocs((prev) => ({ ...prev, afiId: e.target.value }));
  };

  const handleSportToggle = (sportValue, checked) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.sport) ? prev.sport : [];
      if (checked) {
        return { ...prev, sport: [...new Set([...current, sportValue])] };
      }
      const next = current.filter((s) => s !== sportValue);
      return { ...prev, sport: next.length ? next : ['Other'] };
    });
  };

  const handleUploadDocuments = async (e) => {
    e.preventDefault();

    if (!userId) return;

    if (!docs.birthCertificate) {
      toast.error('Birth Certificate file is required.');
      return;
    }
    if (!docs.aadharCard) {
      toast.error('Aadhar Card file is required.');
      return;
    }
    if (!docs.afiId || !String(docs.afiId).trim()) {
      toast.error('AFI ID is required.');
      return;
    }

    setUploadingDocs(true);
    try {
      const payload = new FormData();
      if (docs.birthCertificate) payload.append('birthCertificate', docs.birthCertificate);
      if (docs.aadharCard) payload.append('aadharCard', docs.aadharCard);
      payload.append('afiId', docs.afiId);

      const res = await api.put(`/athletes/${userId}/documents`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData(res.data);
      setDocs({ birthCertificate: null, aadharCard: null, afiId: res.data?.afiId || '' });
      toast.success('Documents uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploadingDocs(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 bg-dark-900 text-center text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-dark-900 relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full"></div>
      
      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-primary mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Athlete Portal</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Edit <span className="text-primary">Profile</span></h1>
          <p className="text-gray-400">Update your personal and sports information.</p>
        </motion.div>

        {formData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 md:p-10"
          >
            {status.message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {status.type === 'success' ? <FiCheckCircle className="text-xl flex-shrink-0" /> : <FiAlertCircle className="text-xl flex-shrink-0" />}
                <p className="font-medium">{status.message}</p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2" htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-900 border border-dark-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white rounded-xl px-4 py-3 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2" htmlFor="age">Age</label>
                  <input 
                    type="number" 
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="5"
                    max="60"
                    className="w-full bg-dark-900 border border-dark-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white rounded-xl px-4 py-3 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2" htmlFor="sport">Sport</label>
                  <div className="grid grid-cols-2 gap-3">
                    {allowedSports.map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-2 bg-dark-900/30 border border-dark-700 rounded-xl px-3 py-2 cursor-pointer hover:border-primary/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={Array.isArray(formData.sport) ? formData.sport.includes(s) : false}
                          onChange={(e) => handleSportToggle(s, e.target.checked)}
                          className="accent-primary"
                        />
                        <span className="text-sm text-white/90">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2" htmlFor="contact">Contact Number</label>
                <input 
                  type="tel" 
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-900 border border-dark-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-white rounded-xl px-4 py-3 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-dark-800 border border-dark-700 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 btn-primary flex justify-center items-center"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 border border-dark-700 text-gray-300 hover:text-white hover:border-dark-600 px-6 py-3 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-dark-700">
              <h2 className="text-xl font-bold text-white mb-4">Upload Documents</h2>
              <form onSubmit={handleUploadDocuments} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2" htmlFor="birthCertificate">
                      Birth Certificate (PDF/JPG/PNG)
                    </label>
                    <input
                      type="file"
                      id="birthCertificate"
                      name="birthCertificate"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleFileChange}
                      disabled={uploadingDocs}
                      className="w-full bg-dark-900 border border-dark-700 text-white rounded-xl px-4 py-3"
                    />
                    {formData.birthCertificate && (
                      <a
                        href={formData.birthCertificate}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-sm hover:underline block mt-2"
                      >
                        View existing
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2" htmlFor="aadharCard">
                      Aadhar Card (PDF/JPG/PNG)
                    </label>
                    <input
                      type="file"
                      id="aadharCard"
                      name="aadharCard"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={handleFileChange}
                      disabled={uploadingDocs}
                      className="w-full bg-dark-900 border border-dark-700 text-white rounded-xl px-4 py-3"
                    />
                    {formData.aadharCard && (
                      <a
                        href={formData.aadharCard}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary text-sm hover:underline block mt-2"
                      >
                        View existing
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-2" htmlFor="afiId">
                      AFI ID
                    </label>
                    <input
                      type="text"
                      id="afiId"
                      name="afiId"
                      value={docs.afiId}
                      onChange={handleAfiIdChange}
                      required
                      disabled={uploadingDocs}
                      className="w-full bg-dark-900 border border-dark-700 text-white rounded-xl px-4 py-3"
                      placeholder="Enter your AFI ID"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadingDocs}
                  className="w-full btn-primary flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingDocs ? 'Uploading...' : 'Upload Documents'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EditRegistration;
