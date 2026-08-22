import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLogOut, FiUser, FiUploadCloud, FiCheckCircle, FiClock, FiEdit2, FiDollarSign, FiAlertCircle, FiEye, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion as Motion, AnimatePresence } from 'framer-motion';
/* eslint-disable no-unused-vars */
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import AlertBox from '../components/AlertBox';
import ScreenshotModal from '../components/ScreenshotModal';

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

// Keep lowercase `motion` available for existing JSX usages
const motion = Motion;

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, paymentId: null });
  const [screenshotModal, setScreenshotModal] = useState({ isOpen: false, imageUrl: null, caption: null });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const navigate = useNavigate();

  const userId = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.id || null;
    } catch {
      return null;
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, paymentsRes] = await Promise.all([
        api.get(`/athlete/${userId}`),
        api.get('/payments/my-fees')
      ]);
      // API uses a wrapper { success, message, data }
      setProfile(profileRes.data?.data || profileRes.data);
      setPayments(paymentsRes.data?.data || paymentsRes.data || []);
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

  // Run redirect and initial fetch when userId is known
  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
      return;
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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

    if (!uploadFile) {
      toast.warning('Please select an image.');
      return;
    }
    if (!uploadModal.paymentId) return;

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('screenshot', uploadFile);

      await api.put(`/payments/${uploadModal.paymentId}/upload`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(
        uploadModal.isResubmit
          ? '✓ New payment proof submitted — it is back in review!'
          : '✓ Payment proof uploaded successfully!'
      );
      setUploadModal({ isOpen: false, paymentId: null });
      setUploadFile(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload payment proof.');
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

      const res = await api.put(`/athlete/${userId}/profile-image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(res.data?.data || res.data);
      setProfileImageFile(null);
      toast.success('Profile image updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile image.');
    } finally {
      setUploadingProfileImage(false);
    }
  };
  // Calculate payment statistics (must be declared before any early returns)
  const stats = useMemo(() => ({
    total: payments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    ),
    approved: payments.reduce(
      (sum, p) =>
        p.status === 'APPROVED'
          ? sum + (p.amount || 0)
          : sum,
      0
    ),
    pending: payments.filter(
      p => p.status === 'PENDING'
    ).length,
    upcoming: payments.length
  }), [payments]);

  if (loading) {
    return (
      <div className="min-h-screen page-shell bg-bg flex items-center justify-center">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const profileLabel = 'text-content-muted text-xs uppercase font-semibold tracking-wider mb-1';

  return (
    <div className="min-h-screen page-shell pb-16 bg-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8 border-b border-border pb-6"
        >
          <div>
            <p className="eyebrow">Athlete Portal</p>
            <h1 className="text-4xl font-display text-content">My Dashboard</h1>
            <p className="text-content-muted mt-2">Fee Status & Payment Management</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-danger hover:bg-danger/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-danger/20"
          >
            <FiLogOut /> Logout
          </button>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardCard
            title="Total Fees"
            value={`₹${stats.total}`}
            subtitle={`${payments.length} months`}
            icon={FiDollarSign}
            tone="primary"
            index={0}
          />
          <DashboardCard
            title="Paid"
            value={`₹${stats.approved}`}
            subtitle="Verified payments"
            icon={FiCheckCircle}
            tone="success"
            index={1}
          />
          <DashboardCard
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting verification"
            icon={FiClock}
            tone="steel"
            index={2}
          />
        </div>

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
            <div className="card p-6 sticky-under-nav">
              <h2 className="text-xl font-bold text-content mb-6 flex items-center gap-2">
                <FiUser className="text-primary" /> Complete Profile
              </h2>

              <div className="flex items-center justify-center mb-6">
                {profile?.profile ? (
                  <img
                    src={profile.profile}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover bg-surface-2 border border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-surface-2 border border-border flex items-center justify-center text-primary font-bold text-3xl">
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
                    className="sm:flex-1 bg-bg border border-border text-content-muted rounded-lg px-1 py-1 text-sm"
                  />
                  <br />
                  <button
                    type="submit"
                    disabled={uploadingProfileImage}
                    className="w-full sm:w-auto px-3 py-2 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FiUploadCloud size={16} />
                    {uploadingProfileImage ? 'Uploading...' : 'Update'}
                  </button>
                </div>
              </form>

              <div className="space-y-3 mt-4">
                <div className="pb-3 border-b border-border">
                  <p className={profileLabel}>Name</p>
                  <p className="text-content font-bold text-lg">{profile?.name}</p>
                </div>
                <div className="pb-3 border-b border-border">
                  <p className={profileLabel}>Email</p>
                  <p className="text-content font-mono text-sm break-all">{profile?.email}</p>
                </div>
                <div className="pb-3 border-b border-border">
                  <p className={profileLabel}>Contact</p>
                  <p className="text-content font-bold">{profile?.contact || 'N/A'}</p>
                </div>
                <div className="pb-3 border-b border-border">
                  <p className={profileLabel}>Sport</p>
                  <p className="text-primary font-semibold text-lg">
                    {Array.isArray(profile?.sports) ? profile.sports.join(', ') : (profile?.sports || 'N/A')}
                  </p>
                </div>
                <div className="pb-3 border-b border-border">
                  <p className={profileLabel}>Age</p>
                  <p className="text-content font-bold">{profile?.age || 'N/A'} years</p>
                </div>
                <div className="pb-3 border-b border-border">
                  <p className={profileLabel}>School Name</p>
                  <p className="text-content text-sm">{profile?.school || 'N/A'}</p>
                </div>
                <div className="pb-3">
                  <p className={profileLabel}>AFI ID</p>
                  <p className="text-content font-mono text-sm">{profile?.afiId || 'N/A'}</p>
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
            <div className="card p-8">

              <h2 className="text-xl font-bold text-content mb-6 flex items-center gap-2">
                <FiDollarSign className="text-primary" /> Payment Instructions
              </h2>

              {/* QR CODE AT TOP */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-full max-w-xs bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src="/phonepe-qr-demo.svg"
                    alt="PhonePe QR Code"
                    className="w-full h-auto"
                  />
                </div>

                <p className="text-content-muted text-sm text-center mt-3 font-medium">
                  Scan to pay via PhonePe / UPI
                </p>
                <p className="text-content-subtle text-xs text-center mt-1">
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
                  <div key={step.num} className="flex gap-4 p-3 bg-bg/50 rounded-lg hover:bg-bg transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-contrast font-display font-bold flex-shrink-0 shadow-lg shadow-primary/30 tabular-nums">
                      {step.num}
                    </div>
                    <div>
                      <p className="font-semibold text-content text-sm">{step.title}</p>
                      <p className="text-content-muted text-xs mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <AlertBox variant="info" icon={FiAlertCircle}>
                <p className="font-semibold">Important</p>
                <p className="text-xs mt-1 opacity-90">
                  Ensure correct amount is paid and screenshot clearly shows transaction ID
                </p>
              </AlertBox>
            </div>
          </motion.div>
        </div>

        {/* Payment History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold text-content mb-6 flex items-center gap-3">
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
              <p className="text-content font-semibold mb-2">No fee records yet</p>
              <p className="text-content-muted text-sm">Admin will generate your monthly fees here</p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainerVariant}
              className="space-y-4"
            >
              {payments.map((payment) => (
                <motion.div
                  key={payment.id}
                  variants={fadeUpVariant}
                  className="bg-surface/60 hover:bg-surface border border-border hover:border-primary/40 rounded-xl p-6 transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left Side - Fee Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FiDollarSign className="text-primary text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-content">{payment.month} {payment.year}</h3>
                          <p className="text-2xl font-display font-bold text-primary tabular-nums">₹{payment.amount}</p>
                          {payment.submittedAt && (
                            <p className="text-content-subtle text-xs mt-1">
                              Proof submitted {new Date(payment.submittedAt).toLocaleDateString()}
                              {payment.status !== 'APPROVED' && ' — you can re-submit until it is approved'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle - Status Badge */}
                    <div className="flex gap-2 items-center">
                      {payment.status === 'APPROVED' && <StatusBadge status="APPROVED" label="Paid" />}
                      {payment.status === 'REJECTED' && <StatusBadge status="REJECTED" />}
                      {payment.status === 'PENDING' && payment.submittedAt && <StatusBadge status="PENDING" label="In Review" />}
                      {payment.status === 'PENDING' && !payment.submittedAt && <StatusBadge status="UNPAID" label="Not Submitted" />}
                    </div>

                    {/* Right Side - Actions. Re-submission stays open until an
                        admin approves the payment. */}
                    <div className="flex flex-wrap gap-2">
                      {payment.screenshot && (
                        <button
                          onClick={() => setScreenshotModal({
                            isOpen: true,
                            imageUrl: payment.screenshot,
                            caption: `${payment.month} ${payment.year} · ₹${payment.amount}`,
                          })}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-steel/30 bg-steel/10 text-steel hover:bg-steel/20 transition-colors"
                        >
                          <FiEye className="w-4 h-4" /> View Proof
                        </button>
                      )}
                      {payment.status !== 'APPROVED' && (
                        <button
                          onClick={() => setUploadModal({
                            isOpen: true,
                            paymentId: payment.id,
                            isResubmit: Boolean(payment.submittedAt),
                          })}
                          className="btn-primary py-2 px-4 text-sm shadow-none flex items-center gap-2"
                        >
                          <FiUploadCloud className="w-4 h-4" />
                          {payment.submittedAt ? 'Re-submit Proof' : 'Upload Proof'}
                        </button>
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
            // z-[60] clears the z-50 navbar; the flex overlay + max-h keeps the
            // panel inside the window whatever the screen height.
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <div
                onClick={() => setUploadModal({ isOpen: false, paymentId: null })}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-sm max-h-full overflow-y-auto"
              >
                <div className="bg-bg p-4 rounded-2xl border-2 border-primary shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-content">
                      {uploadModal.isResubmit ? 'Re-submit Payment Proof' : 'Upload Payment Proof'}
                    </h2>
                    <button
                      onClick={() => setUploadModal({ isOpen: false, paymentId: null })}
                      className="text-content-muted hover:text-content transition-colors p-2 rounded-lg hover:bg-surface-2"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  {uploadModal.isResubmit && (
                    <p className="text-content-muted text-xs mb-3">
                      This replaces the proof you submitted earlier and sends the payment back for review.
                    </p>
                  )}

                  {/* Form */}
                  <form onSubmit={submitUpload} className="space-y-3">
                    {/* File Upload Area */}
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`
                        relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer
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
                          <div className="bg-primary/20 p-2 rounded-full">
                            <FiUploadCloud className="w-7 h-7 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-content font-bold text-sm">
                            {uploadFile ? uploadFile.name : 'Drag image or click to select'}
                          </p>
                          <p className="text-content-muted text-xs mt-1">
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
                        className="rounded-xl overflow-hidden bg-surface p-3 border border-primary/30"
                      >
                        <img
                          src={URL.createObjectURL(uploadFile)}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </motion.div>
                    )}

                    {/* Info */}
                    <AlertBox variant="info" icon={FiAlertCircle}>
                      <p className="text-xs font-medium leading-tight">
                        Upload screenshot showing payment amount and transaction ID from your UPI/PhonePe app
                      </p>
                    </AlertBox>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2 pb-1">
                      <button
                        type="button"
                        onClick={() => setUploadModal({ isOpen: false, paymentId: null })}
                        disabled={uploading}
                        className="flex-1 px-3 py-2 bg-surface-2 text-content-muted rounded-lg hover:bg-surface transition-colors font-semibold disabled:opacity-50 text-xs border border-border"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!uploadFile || uploading}
                        className="flex-1 px-3 py-2 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-contrast"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiUploadCloud className="w-4 h-4" />
                            {uploadModal.isResubmit ? 'Re-submit Proof' : 'Upload Proof'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submitted Proof Preview */}
        <ScreenshotModal
          isOpen={screenshotModal.isOpen}
          imageUrl={screenshotModal.imageUrl}
          caption={screenshotModal.caption}
          title="Your Payment Proof"
          onClose={() => setScreenshotModal({ isOpen: false, imageUrl: null, caption: null })}
        />

      </div>
    </div>

  );
};

export default StudentDashboard;
