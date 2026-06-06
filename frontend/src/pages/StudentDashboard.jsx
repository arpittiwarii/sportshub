import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLogOut, FiUser, FiUploadCloud, FiCheckCircle, FiClock, FiXCircle, FiEdit2, FiDollarSign, FiAlertCircle, FiX, FiTrendingUp, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from '../components/DashboardCard';

// Animation variants
const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, paymentId: null });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr)._id : null;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, paymentsRes] = await Promise.all([
        api.get(`/athletes/${userId}`),
        api.get('/payments/my-payments')
      ]);
      setProfile(profileRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDashboardData();
    else navigate('/login');
    // eslint-disable-next-line
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUploadClick = (paymentId) => {
    setUploadModal({ isOpen: true, paymentId });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setUploadFile(selectedFile);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setUploadFile(droppedFile);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.warning('Please select a file to upload');

    setUploading(true);
    const paymentId = uploadModal.paymentId;
    const formData = new FormData();
    formData.append('screenshot', uploadFile);

    try {
      await api.put(`/payments/${paymentId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('✓ Payment proof uploaded successfully!');
      setUploadModal({ isOpen: false, paymentId: null });
      setUploadFile(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload proof.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageSubmit = async (e) => {
    e.preventDefault();

    if (!profileImageFile) {
      toast.warning('Please select an image.');
      return;
    }

    setUploadingProfileImage(true);
    try {
      const payload = new FormData();
      payload.append('profileImage', profileImageFile);

      const res = await api.put(`/athletes/${userId}/profile-image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(res.data);
      setProfileImageFile(null);
      toast.success('Profile image updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile image.');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-dark-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Calculate payment statistics
  const stats = {
    total: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    approved: payments.reduce((sum, p) => p.status === 'approved' ? sum + (p.amount || 0) : sum, 0),
    pending: payments.filter(p => p.status === 'pending').length,
    upcoming: payments.length
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-dark-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8 border-b border-dark-700 pb-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-white">My Dashboard</h1>
            <p className="text-gray-400 mt-2">Fee Status & Payment Management</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
          >
            <FiLogOut /> Logout
          </button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainerVariant}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <motion.div variants={fadeUpVariant}>
            <DashboardCard
              title="Total Fees"
              value={`₹${stats.total}`}
              subtitle={`${payments.length} months`}
              icon={FiDollarSign}
              gradient="from-primary to-accent-green"
            />
          </motion.div>
          <motion.div variants={fadeUpVariant}>
            <DashboardCard
              title="Paid"
              value={`₹${stats.approved}`}
              subtitle="Verified payments"
              icon={FiCheckCircle}
              gradient="from-green-400 to-emerald-500"
            />
          </motion.div>
          <motion.div variants={fadeUpVariant}>
            <DashboardCard
              title="Pending"
              value={stats.pending}
              subtitle="Awaiting verification"
              icon={FiClock}
              gradient="from-primary to-accent-red"
            />
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Sidebar - Profile & Payment QR */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Info Card */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-primary/40 rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiUser className="text-primary" /> Complete Profile
              </h2>

              <div className="flex items-center justify-center mb-6">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover bg-dark-800 border border-dark-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-primary font-bold text-3xl">
                    {profile?.name?.slice(0, 1)?.toUpperCase() || '—'}
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileImageSubmit} className="mt-2 flex flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-wrap justify-center">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                    disabled={uploadingProfileImage}
                    className="sm:flex-1 bg-dark-900 border border-dark-700 text-gray-300 rounded-lg px-1 py-1 text-sm"
                  />
                  <br />
                  <button
                    type="submit"
                    disabled={uploadingProfileImage}
                    className="w-full sm:w-auto px-1 py-1 btn-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiUploadCloud size={16} />
                    {uploadingProfileImage ? 'Uploading...' : 'Update'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {/* Personal Information */}
                <div className="pb-3 border-b border-dark-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Name</p>
                  <p className="text-white font-bold text-lg">{profile?.name}</p>
                </div>
                <div className="pb-3 border-b border-dark-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Email</p>
                  <p className="text-white font-mono text-sm break-all">{profile?.email}</p>
                </div>
                <div className="pb-3 border-b border-dark-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Contact</p>
                  <p className="text-white font-bold">{profile?.contact || 'N/A'}</p>
                </div>

                {/* Athletic Information */}
                <div className="pb-3 border-b border-dark-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Sport</p>
                  <p className="text-primary font-semibold text-lg">
                    {Array.isArray(profile?.sport) ? profile.sport.join(', ') : (profile?.sport || 'N/A')}
                  </p>
                </div>
                <div className="pb-3 border-b border-dark-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Age</p>
                  <p className="text-white font-bold">{profile?.age || 'N/A'} years</p>
                </div>

                {/* Additional Details */}
                <div className="pb-3 border-b border-dark-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">School Name</p>
                  <p className="text-white text-sm">{profile?.schoolName || 'N/A'}</p>
                </div>
                <div className="pb-3">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">AFI ID</p>
                  <p className="text-white font-mono text-sm">{profile?.afiId || 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/edit-registration')}
                className="w-full btn-primary py-2 px-4 text-sm shadow-none flex items-center justify-center gap-2 mt-4"
              >
                <FiEdit2 /> Edit Profile
              </button>
            </div>

          </motion.div>

          {/* Right Content - Payment Instructions & History */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Payment Instructions Card */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-primary/40 rounded-2xl p-8 shadow-xl">
              
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiDollarSign className="text-primary" /> Payment Instructions
              </h2>

              {/* 🔥 QR CODE AT TOP */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-full max-w-xs bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src="/phonepe-qr-demo.svg"
                    alt="PhonePe QR Code"
                    className="w-full h-auto"
                  />
                </div>

                <p className="text-gray-300 text-sm text-center mt-3 font-medium">
                  Scan to pay via PhonePe / UPI
                </p>
                <p className="text-gray-400 text-xs text-center mt-1">
                  (Make payment before uploading proof)
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {[
                  { num: 1, title: "Scan QR & Pay", desc: "Use PhonePe / Google Pay / UPI" },
                  { num: 2, title: "Take Screenshot", desc: "Capture payment confirmation" },
                  { num: 3, title: "Upload Proof", desc: "Click 'Upload Proof' below" },
                  { num: 4, title: "Get Verified", desc: "Admin approves within 24 hours" }
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 p-3 bg-dark-900/50 rounded-lg hover:bg-dark-900 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-black font-bold flex-shrink-0 shadow-lg shadow-primary/50">
                      {step.num}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{step.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex gap-3">
                <FiAlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 font-semibold text-sm">Important</p>
                  <p className="text-blue-200 text-xs mt-1">
                    Ensure correct amount is paid and screenshot clearly shows transaction ID
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FiClock className="text-primary" />
            Fee Status & Payment History
          </h2>
          {payments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-300 font-semibold mb-2">No fee records yet</p>
              <p className="text-gray-400 text-sm">Admin will generate your monthly fees here</p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainerVariant}
              className="space-y-4"
            >
              {payments.map((payment, idx) => (
                <motion.div
                  key={payment._id}
                  variants={fadeUpVariant}
                  className="bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-primary/40 rounded-xl p-6 transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left Side - Fee Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FiDollarSign className="text-primary text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{payment.month} {payment.year}</h3>
                          <p className="text-2xl font-bold text-primary">₹{payment.amount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle - Status Badge */}
                    <div className="flex gap-2 items-center">
                      {payment.status === 'approved' && (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/15 border border-green-500/40 rounded-lg"
                        >
                          <FiCheckCircle className="text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">Paid</span>
                        </motion.div>
                      )}
                      {payment.status === 'rejected' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/40 rounded-lg">
                          <FiXCircle className="text-red-400" />
                          <span className="text-red-400 font-semibold text-sm">Rejected</span>
                        </div>
                      )}
                      {payment.status === 'pending' && payment.screenshot && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary/40 rounded-lg">
                          <FiClock className="text-primary" />
                          <span className="text-primary font-semibold text-sm">In Review</span>
                        </div>
                       
                      )}
                      {payment.status === 'pending' && !payment.screenshot && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/15 border border-gray-500/40 rounded-lg">
                          <FiAlertCircle className="text-gray-400" />
                          <span className="text-gray-400 font-semibold text-sm">Awaiting Proof</span>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex gap-2">
                      {payment.status === 'approved' && (
                        <div className="text-sm text-green-400 font-semibold">
                          ✓ {new Date(payment.verifiedAt).toLocaleDateString()}
                        </div>
                      )}
                      {payment.status !== 'approved' && (
                        <>
                          {payment.screenshot && (
                            <a
                              href={payment.screenshot.startsWith('http') ? payment.screenshot : `https://sportshub-backend-mzth.onrender.com${payment.screenshot}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 text-sm rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 border border-dark-600 transition-all flex items-center gap-2"
                            >
                              📸 View
                            </a>
                          )}
                          <button
                            onClick={() => handleUploadClick(payment._id)}
                            className="px-4 py-2 text-sm rounded-lg bg-primary hover:brightness-110 text-black font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/50"
                          >
                            <FiUploadCloud /> {payment.screenshot ? 'Update' : 'Upload'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUploadModal({ isOpen: false, paymentId: null })}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 sm:inset-8 top-auto max-w-sm mx-auto z-50 max-h-[calc(100vh-2rem)] overflow-y-auto"
            >
              <div className="bg-dark-900 p-4 rounded-2xl border-2 border-primary shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Upload Payment Proof</h2>
                  <button
                    onClick={() => setUploadModal({ isOpen: false, paymentId: null })}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-dark-700"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={submitUpload} className="space-y-3">
                  {/* File Upload Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                        relative border-3 border-dashed rounded-2xl p-5 text-center cursor-pointer
                        transition-all duration-300
                        ${dragActive
                        ? 'border-primary bg-primary/20 scale-105'
                        : 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
                      }
                      `}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />

                    <div className="space-y-1">
                      <div className="flex justify-center">
                        <div className="bg-primary/30 p-2 rounded-full">
                          <FiUploadCloud className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {uploadFile ? uploadFile.name : 'Drag image or click to select'}
                        </p>
                        <p className="text-gray-300 text-xs mt-1">
                          {uploadFile ? `${(uploadFile.size / 1024).toFixed(2)} KB` : 'JPG, PNG up to 5MB'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Preview */}
                  {uploadFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl overflow-hidden bg-dark-800 p-3 border border-primary/30"
                    >
                      <img
                        src={URL.createObjectURL(uploadFile)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </motion.div>
                  )}

                  {/* Info */}
                  <div className="flex gap-2 bg-blue-500/15 border-2 border-blue-500/50 rounded-lg p-2">
                    <FiAlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-200 font-medium leading-tight">
                      Upload screenshot showing payment amount and transaction ID from your UPI/PhonePe app
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2 pb-1">
                    <button
                      type="button"
                      onClick={() => setUploadModal({ isOpen: false, paymentId: null })}
                      disabled={uploading}
                      className="flex-1 px-3 py-2 bg-dark-700 text-gray-200 rounded-lg hover:bg-dark-600 transition-colors font-semibold disabled:opacity-50 text-xs border border-dark-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadFile || uploading}
                      className="flex-1 px-3 py-2 btn-primary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiUploadCloud className="w-4 h-4" />
                          Upload Proof
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
    </div>
    
  );
};

export default StudentDashboard;
