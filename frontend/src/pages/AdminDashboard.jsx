import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLogOut, FiUsers, FiDollarSign, FiCheckCircle, FiClock, FiTrash2, FiAlertCircle, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, students, payments, generate
  const [generateForm, setGenerateForm] = useState({ month: 'January', year: new Date().getFullYear(), amount: 1000 });
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminProfileImageFile, setAdminProfileImageFile] = useState(null);
  const [uploadingAdminProfileImage, setUploadingAdminProfileImage] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, paymentsRes, adminProfileRes] = await Promise.all([
        api.get('/athlete'),
        api.get('/payments'),
        api.get('/admin/profile'),
      ]);
      setStudents((studentsRes.data?.data || studentsRes.data) ?? []);
      setPayments((paymentsRes.data?.data || paymentsRes.data) ?? []);
      setAdminProfile((adminProfileRes.data?.data || adminProfileRes.data) ?? []);

    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error('Failed to load data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateStudentStatus = async (id, status) => {
    try {
      await api.put(`/athlete/${id}/status`, { status });
      toast.success(`Student ${status} successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update student status.');
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Delete this registration?')) {
      try {
        await api.delete(`/athlete/${id}`);
        toast.success(`Student deleted successfully!`);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete student.');
      }
    }
  };

  const handleApproveStudent = async (id) => {
    await updateStudentStatus(id, 'APPROVED');
  };

  const handleRejectStudent = async (id) => {
    await updateStudentStatus(id, 'REJECTED');
  };

  const handleApprovePayment = async (id) => {
    await verifyPayment(id, 'APPROVED');
  };

  const handleRejectPayment = async (id) => {
    await verifyPayment(id, 'REJECTED');
  };

  const verifyPayment = async (id, status) => {
    try {
      await api.put(`/payments/${id}/verify`, { status });
      toast.success(`Payment ${status} successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update payment status.');
    }
  };

  const generatePayments = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/payments/generate`, generateForm);
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to generate payments.');
    }
  };

  const uploadAdminProfileImage = async (e) => {
    e.preventDefault();
    if (!adminProfileImageFile) {
      toast.warning('Please select a profile image.');
      return;
    }

    setUploadingAdminProfileImage(true);
    try {
      const payload = new FormData();
      payload.append('profileImage', adminProfileImageFile);

      const res = await api.put('/admin/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAdminProfile(res.data?.data || res.data);
      setAdminProfileImageFile(null);
      toast.success('Admin profile image updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload admin image.');
    } finally {
      setUploadingAdminProfileImage(false);
    }
  };

const pendingStudents = (Array.isArray(students) ? students : [])
  .filter(s => s.status === 'PENDING');

const approvedStudents = (Array.isArray(students) ? students : [])
  .filter(s => s.status === 'APPROVED');

  // Defaulters: Payments that are pending or rejected
  const actionRequiredPayments = payments.filter(p => p.status === 'PENDING' && p.submittedAt); // Need admin review
  const unpaidPayments = payments.filter(p => ['PENDING', 'REJECTED'].includes(p.status) && !p.submittedAt);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const tabs = [
    { key: 'pending', label: `Pending Approvals (${pendingStudents.length})` },
    { key: 'students', label: `Approved Students (${approvedStudents.length})` },
    { key: 'payments', label: `Review Payments (${actionRequiredPayments.length})` },
    { key: 'defaulters', label: `Defaulters / Unpaid (${unpaidPayments.length})` },
    { key: 'generate', label: 'Generate Fees' },
  ];

  const fieldLabel = 'text-content-subtle font-semibold text-xs uppercase mb-1';

  return (
    <div className="min-h-screen page-shell pb-16 bg-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 border-b border-border pb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center text-primary-contrast text-3xl shadow-lg shadow-primary/40">
              <FiUsers />
            </div>
            <div>
              <p className="eyebrow">Management Center</p>
              <h1 className="text-4xl font-display text-content">Admin Dashboard</h1>
              <p className="text-content-muted text-lg">Aarambh Athletics Hub Management Center</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-danger hover:bg-danger/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-danger/20"
          >
            <FiLogOut /> Logout
          </button>
        </motion.div>

        {/* ==================== ADMIN PROFILE (embedded) ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="card p-6 flex flex-col md:flex-row md:items-center md:justify-around gap-6">
            <div className="flex items-center gap-4 justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
                {adminProfile?.profile ? (
                  <img
                    src={adminProfile.profile}
                    alt="Admin profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-primary w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-content font-bold text-lg">{adminProfile?.name || 'Admin'}</p>
                <p className="text-content-muted text-sm">{adminProfile?.email || 'admin@aarambhathleticshub.com'}</p>
              </div>
            </div>

            <form onSubmit={uploadAdminProfileImage} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(e) => setAdminProfileImageFile(e.target.files?.[0] || null)}
                disabled={uploadingAdminProfileImage}
                className="bg-bg border border-border text-content-muted rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={uploadingAdminProfileImage}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingAdminProfileImage ? 'Uploading...' : 'Update'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* ==================== STATISTICS SECTION ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardCard
            title="Total Students"
            value={students.length}
            subtitle={`${approvedStudents.length} approved`}
            icon={FiUsers}
            tone="primary"
            index={0}
          />
          <DashboardCard
            title="Pending Approvals"
            value={pendingStudents.length}
            subtitle="Awaiting action"
            icon={FiAlertCircle}
            tone="steel"
            index={1}
          />
          <DashboardCard
            title="Payment Review"
            value={actionRequiredPayments.length}
            subtitle="Pending verification"
            icon={FiDollarSign}
            tone="success"
            index={2}
          />
          <DashboardCard
            title="Unpaid Fees"
            value={unpaidPayments.length}
            subtitle="Defaulters list"
            icon={FiClock}
            tone="danger"
            index={3}
          />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-4 mb-6 border-b border-border pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-2 whitespace-nowrap font-medium transition-colors border-b-2 ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pendingStudents.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-border rounded-2xl bg-surface/30">
                <FiCheckCircle className="text-4xl text-primary mx-auto mb-4 opacity-50" />
                <p className="text-content-muted text-lg">All caught up! No pending approvals.</p>
              </div>
            ) : pendingStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card p-6 hover:border-primary/50 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={`${student.name} profile`}
                          className="w-10 h-10 rounded-full object-cover bg-surface-2 border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-primary font-bold flex-shrink-0">
                          {student.name?.slice(0, 1)?.toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-content group-hover:text-primary transition-colors truncate flex-1">{student.name}</h3>
                    </div>
                    <StatusBadge status="PENDING" />
                  </div>

                  {/* Complete Student Information */}
                  <div className="space-y-3 text-sm bg-bg/50 rounded-lg p-4 mb-4">
                    <div>
                      <p className={fieldLabel}>Email</p>
                      <p className="text-content-muted break-all text-xs sm:text-sm">{student.email}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Contact</p>
                      <p className="text-content font-medium">{student.contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Sport</p>
                      <p className="text-primary font-bold">
                        {Array.isArray(student.sports) ? student.sports.join(', ') : (student.sports || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Age</p>
                      <p className="text-content font-medium">{student.age || 'N/A'} years</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>School Name</p>
                      <p className="text-content-muted text-xs sm:text-sm">{student.school || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>AFI ID</p>
                      <p className="text-content-muted font-mono text-xs sm:text-sm">{student.afiId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => handleApproveStudent(student.id)}
                    className="flex-1 btn-primary py-2 px-3 text-sm shadow-none"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectStudent(student.id)}
                    className="flex-1 btn-secondary text-danger border-danger/30 hover:bg-danger/10 py-2 px-3 text-sm font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Approved Students Tab */}
        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {approvedStudents.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-border rounded-2xl bg-surface/30">
                <FiUsers className="text-4xl text-primary mx-auto mb-4 opacity-50" />
                <p className="text-content-muted text-lg">No approved students yet.</p>
              </div>
            ) : approvedStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card p-6 hover:border-primary/50 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={`${student.name} profile`}
                          className="w-10 h-10 rounded-full object-cover bg-surface-2 border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center text-primary font-bold flex-shrink-0">
                          {student.name?.slice(0, 1)?.toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-content group-hover:text-primary transition-colors truncate flex-1">{student.name}</h3>
                    </div>
                    <StatusBadge status="APPROVED" />
                  </div>

                  {/* Complete Student Information */}
                  <div className="space-y-3 text-sm bg-bg/50 rounded-lg p-4">
                    <div>
                      <p className={fieldLabel}>Email</p>
                      <p className="text-content-muted break-all text-xs sm:text-sm">{student.email}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Contact</p>
                      <p className="text-content font-medium">{student.contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Sport</p>
                      <p className="text-primary font-bold">
                        {Array.isArray(student.sports) ? student.sports.join(', ') : (student.sports || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Age</p>
                      <p className="text-content font-medium">{student.age || 'N/A'} years</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>School Name</p>
                      <p className="text-content-muted text-xs sm:text-sm">{student.school || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>AFI ID</p>
                      <p className="text-content-muted font-mono text-xs sm:text-sm">{student.afiId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="w-full text-danger border border-danger/30 hover:bg-danger/10 py-2 px-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiTrash2 size={16} /> Delete Student
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {actionRequiredPayments.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-border rounded-2xl bg-surface/30">
                <FiCheckCircle className="text-4xl text-success mx-auto mb-4 opacity-50" />
                <p className="text-content-muted text-lg">No payments waiting for review.</p>
              </div>
            ) : actionRequiredPayments.map((payment, idx) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card p-6 hover:border-primary/50 flex flex-col justify-between group"
              >
                <div>
                  {/* Student Info Header */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-content group-hover:text-primary transition-colors">
                        {payment.user?.name || payment.studentId?.name || 'Unknown'}
                      </h3>
                      <p className="text-content-muted text-xs">{payment.month} {payment.year}</p>
                    </div>
                    <span className="text-xl font-bold text-primary whitespace-nowrap tabular-nums">₹{payment?.amount}</span>
                  </div>

                  {/* Student Details Card */}
                  <div className="space-y-2 text-sm bg-bg/50 rounded-lg p-4 mb-4">
                    <div>
                      <p className={fieldLabel}>Email</p>
                      <p className="text-content-muted break-all text-xs">{payment?.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Contact</p>
                      <p className="text-content font-medium text-xs">{payment?.user?.contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>Sport</p>
                      <p className="text-primary font-bold text-xs">
                        {Array.isArray(payment?.user?.sports)
                          ? payment?.user?.sports.join(', ')
                          : (payment?.user?.sports || 'N/A')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleApprovePayment(payment.id)}
                    className="flex-1 btn-primary py-2 px-3 text-sm shadow-none"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectPayment(payment.id)}
                    className="flex-1 btn-secondary text-danger border-danger/30 hover:bg-danger/10 py-2 px-3 text-sm font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Defaulters Tab */}
        {activeTab === 'defaulters' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {unpaidPayments.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-border rounded-2xl bg-surface/30">
                <FiCheckCircle className="text-4xl text-success mx-auto mb-4 opacity-50" />
                <p className="text-content-muted text-lg">All fees are collected! 🎉</p>
              </div>
            ) : unpaidPayments.map((payment, idx) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-surface to-bg border border-danger/30 hover:border-danger/50 rounded-2xl p-6 shadow-card hover:shadow-xl hover:shadow-danger/20 transition-all duration-300 group"
              >
                {/* Payment Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-content group-hover:text-danger transition-colors flex-1">
                      {payment.user?.name || 'Unknown'}
                    </h3>
                    <span className="text-xl font-bold text-danger whitespace-nowrap tabular-nums">₹{payment.amount}</span>
                  </div>
                  <p className="text-content-muted text-sm">{payment.month} {payment.year}</p>
                </div>

                {/* Student Details Card */}
                <div className="space-y-2 text-sm bg-bg/50 rounded-lg p-4 mb-4">
                  <div>
                    <p className={fieldLabel}>Email</p>
                    <p className="text-content-muted break-all text-xs">{payment.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={fieldLabel}>Contact</p>
                    <p className="text-content font-medium text-xs">{payment.user?.contact || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={fieldLabel}>Sport</p>
                    <p className="text-primary font-bold text-xs">
                      {Array.isArray(payment.user?.sports)
                        ? payment.user.sports.join(', ')
                        : (payment.user?.sports || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className={fieldLabel}>Age</p>
                    <p className="text-content font-medium text-xs">{payment.user?.age || 'N/A'} years</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-border">
                  <StatusBadge status={payment.status === 'REJECTED' ? 'REJECTED' : 'UNPAID'} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Generate Fees Tab */}
        {activeTab === 'generate' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card p-8">
              <h2 className="text-3xl font-display text-content mb-3">Generate Monthly Fee</h2>
              <p className="text-content-muted mb-8">This will create a new payment record for all currently approved students for the specified month.</p>

              <form onSubmit={generatePayments} className="space-y-6">
                <div>
                  <label className="block text-content font-semibold mb-3">Month</label>
                  <select
                    value={generateForm.month}
                    onChange={e => setGenerateForm({ ...generateForm, month: e.target.value })}
                    className="w-full bg-bg border border-border hover:border-primary/50 focus:border-primary outline-none text-content rounded-lg px-4 py-3 transition-colors"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-content font-semibold mb-3">Year</label>
                    <input
                      type="number"
                      value={generateForm.year}
                      onChange={e => setGenerateForm({ ...generateForm, year: e.target.value })}
                      className="w-full bg-bg border border-border hover:border-primary/50 focus:border-primary outline-none text-content rounded-lg px-4 py-3 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-content font-semibold mb-3">Amount (₹)</label>
                    <input
                      type="number"
                      value={generateForm.amount}
                      onChange={e => setGenerateForm({ ...generateForm, amount: Number(e.target.value) })}
                      className="w-full bg-bg border border-border hover:border-primary/50 focus:border-primary outline-none text-content rounded-lg px-4 py-3 transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                >
                  Generate {approvedStudents.length > 0 ? `for ${approvedStudents.length} Students` : 'Payment Records'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
