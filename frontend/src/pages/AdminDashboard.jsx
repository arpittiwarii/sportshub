import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiLogOut, FiUsers, FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiTrash2, FiFileText, FiTrendingUp, FiAlertCircle, FiUploadCloud, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardCard from '../components/DashboardCard';

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
      setStudents(studentsRes.data?.data || studentsRes.data);
      setPayments(paymentsRes.data?.data || paymentsRes.data);
      setAdminProfile(adminProfileRes.data?.data || adminProfileRes.data);

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
      // console.log(adminProfile)
      // console.log(generateForm)
      // generateForm({userId:adminProfile.id})
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

  const pendingStudents = students.filter(s => s.status === 'PENDING');
  const approvedStudents = students.filter(s => s.status === 'APPROVED');

  // Defaulters: Payments that are pending or rejected
  const actionRequiredPayments = payments.filter(p => p.status === 'PENDING' && p.submittedAt); // Need admin review
  const unpaidPayments = payments.filter(p => ['PENDING', 'REJECTED'].includes(p.status) && !p.submittedAt);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-dark-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 border-b border-dark-700 pb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center text-black text-3xl font-bold shadow-lg shadow-primary/50">
              <FiUsers />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-lg">Arambh Atheletes Management Center</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
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
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-primary/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-800 border border-dark-700 flex items-center justify-center">
                {adminProfile?.profileImage ? (
                  <img
                    src={adminProfile.profileImage}
                    alt="Admin profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-primary w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{adminProfile?.name || 'Admin'}</p>
                <p className="text-gray-400 text-sm">{adminProfile?.email || 'admin@sportshub.com'}</p>
              </div>
            </div>

            <form onSubmit={uploadAdminProfileImage} className="flex items-center gap-3">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(e) => setAdminProfileImageFile(e.target.files?.[0] || null)}
                disabled={uploadingAdminProfileImage}
                className="bg-dark-900 border border-dark-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={uploadingAdminProfileImage}
                className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingAdminProfileImage ? 'Uploading...' : 'Update'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* ==================== STATISTICS SECTION ==================== */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
          >
            <DashboardCard
              title="Total Students"
              value={students.length}
              subtitle={`${approvedStudents.length} approved`}
              icon={FiUsers}
              gradient="from-primary to-accent-green"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
          >
            <DashboardCard
              title="Pending Approvals"
              value={pendingStudents.length}
              subtitle="Awaiting action"
              icon={FiAlertCircle}
              gradient="from-primary to-accent-red"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
          >
            <DashboardCard
              title="Payment Review"
              value={actionRequiredPayments.length}
              subtitle="Pending verification"
              icon={FiDollarSign}
              gradient="from-green-400 to-emerald-500"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
          >
            <DashboardCard
              title="Unpaid Fees"
              value={unpaidPayments.length}
              subtitle="Defaulters list"
              icon={FiClock}
              gradient="from-red-400 to-red-500"
            />
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-4 mb-6 border-b border-dark-700 pb-2">
          <button onClick={() => setActiveTab('pending')} className={`pb-2 px-2 whitespace-nowrap font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
            Pending Approvals ({pendingStudents.length})
          </button>
          <button onClick={() => setActiveTab('students')} className={`pb-2 px-2 whitespace-nowrap font-medium transition-colors border-b-2 ${activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
            Approved Students ({approvedStudents.length})
          </button>
          <button onClick={() => setActiveTab('payments')} className={`pb-2 px-2 whitespace-nowrap font-medium transition-colors border-b-2 ${activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
            Review Payments ({actionRequiredPayments.length})
          </button>
          <button onClick={() => setActiveTab('defaulters')} className={`pb-2 px-2 whitespace-nowrap font-medium transition-colors border-b-2 ${activeTab === 'defaulters' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
            Defaulters / Unpaid ({unpaidPayments.length})
          </button>
          <button onClick={() => setActiveTab('generate')} className={`pb-2 px-2 whitespace-nowrap font-medium transition-colors border-b-2 ${activeTab === 'generate' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}>
            Generate Fees
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pendingStudents.length === 0 ? (
              <div className="col-span-full text-center py-16 border border-dark-700 rounded-2xl bg-dark-800/30">
                <FiCheckCircle className="text-4xl text-primary mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">All caught up! No pending approvals.</p>
              </div>
            ) : pendingStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-primary/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={`${student.name} profile`}
                          className="w-10 h-10 rounded-full object-cover bg-dark-800 border border-dark-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-primary font-bold flex-shrink-0">
                          {student.name?.slice(0, 1)?.toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors truncate flex-1">{student.name}</h3>
                    </div>
                    <span className="px-3 py-1 bg-primary/15 text-primary text-xs rounded-full border border-primary/30 font-semibold whitespace-nowrap flex-shrink-0">Pending</span>
                  </div>

                  {/* Complete Student Information */}
                  <div className="space-y-3 text-sm bg-dark-900/50 rounded-lg p-4 mb-4">
                    {/* Personal Details */}
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Email</p>
                      <p className="text-gray-300 break-all text-xs sm:text-sm">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Contact</p>
                      <p className="text-white font-medium">{student.contact || 'N/A'}</p>
                    </div>

                    {/* Athletic Information */}
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Sport</p>
                      <p className="text-primary font-bold">
                        {Array.isArray(student.sports) ? student.sports.join(', ') : (student.sports || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Age</p>
                      <p className="text-white font-medium">{student.age || 'N/A'} years</p>
                    </div>

                    {/* Additional Details */}
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">School Name</p>
                      <p className="text-gray-300 text-xs sm:text-sm">{student.school || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">AFI ID</p>
                      <p className="text-gray-300 font-mono text-xs sm:text-sm">{student.afiId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6 pt-4 border-t border-dark-700">
                  <button
                    onClick={() => handleApproveStudent(student.id)}
                    className="flex-1 btn-primary py-2 px-3 text-sm font-semibold shadow-none"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectStudent(student.id)}
                    className="flex-1 btn-secondary text-red-400 border-red-400/30 hover:bg-red-400/10 py-2 px-3 text-sm font-semibold"
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
              <div className="col-span-full text-center py-16 border border-dark-700 rounded-2xl bg-dark-800/30">
                <FiUsers className="text-4xl text-primary mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">No approved students yet.</p>
              </div>
            ) : approvedStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-primary/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={`${student.name} profile`}
                          className="w-10 h-10 rounded-full object-cover bg-dark-800 border border-dark-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center text-primary font-bold flex-shrink-0">
                          {student.name?.slice(0, 1)?.toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors truncate flex-1">{student.name}</h3>
                    </div>
                    <span className="px-3 py-1 bg-green-500/15 text-green-400 text-xs rounded-full border border-green-500/30 font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                      <FiCheckCircle size={14} /> Approved
                    </span>
                  </div>

                  {/* Complete Student Information */}
                  <div className="space-y-3 text-sm bg-dark-900/50 rounded-lg p-4">
                    {/* Personal Details */}
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Email</p>
                      <p className="text-gray-300 break-all text-xs sm:text-sm">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Contact</p>
                      <p className="text-white font-medium">{student.contact || 'N/A'}</p>
                    </div>

                    {/* Athletic Information */}
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Sport</p>
                      <p className="text-primary font-bold">
                        {Array.isArray(student.sports) ? student.sports.join(', ') : (student.sports || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Age</p>
                      <p className="text-white font-medium">{student.age || 'N/A'} years</p>
                    </div>

                    {/* Additional Details */}
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">School Name</p>
                      <p className="text-gray-300 text-xs sm:text-sm">{student.school || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">AFI ID</p>
                      <p className="text-gray-300 font-mono text-xs sm:text-sm">{student.afiId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="w-full text-red-400 border border-red-400/30 hover:bg-red-400/10 py-2 px-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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
              <div className="col-span-full text-center py-16 border border-dark-700 rounded-2xl bg-dark-800/30">
                <FiCheckCircle className="text-4xl text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">No payments waiting for review.</p>
              </div>
            ) : actionRequiredPayments.map((payment, idx) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 hover:border-primary/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Student Info Header */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {payment.studentId?.name || 'Unknown'}
                      </h3>
                      <p className="text-gray-400 text-xs">{payment.month} {payment.year}</p>
                    </div>
                    <span className="text-xl font-bold text-primary whitespace-nowrap">₹{payment?.amount}</span>
                  </div>

                  {/* Student Details Card */}
                  <div className="space-y-2 text-sm bg-dark-900/50 rounded-lg p-4 mb-4">
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Email</p>
                      <p className="text-gray-300 break-all text-xs">{payment?.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Contact</p>
                      <p className="text-white font-medium text-xs">{payment?.user?.contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Sport</p>
                      <p className="text-primary font-bold text-xs">
                        {Array.isArray(payment?.user?.sports)
                          ? payment?.user?.sports.join(', ')
                          : (payment?.user?.sports || 'N/A')}
                      </p>
                    </div>
                  </div>

                  {/* Payment Screenshot */}
                  {/* {payment.screenshot && (
                    <a
                      href={payment.screenshot.startsWith('http') ? payment.screenshot : `https://sportshub-backend-mzth.onrender.com${payment.screenshot}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-40 mb-4 bg-dark-900 rounded-lg border border-dark-700 overflow-hidden relative group/img hover:border-primary/50 transition-colors"
                    >
                      <img
                        src={payment.screenshot.startsWith('http') ? payment.screenshot : `https://sportshub-backend-mzth.onrender.com${payment.screenshot}`}
                        alt="Payment proof"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  )} */}
                </div>

                <div className="flex gap-2 pt-4 border-t border-dark-700">
                  <button
                    onClick={() => handleApprovePayment(payment.id)}
                    className="flex-1 btn-primary py-2 px-3 text-sm font-semibold shadow-none"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectPayment(payment.id)}
                    className="flex-1 btn-secondary text-red-400 border-red-400/30 hover:bg-red-400/10 py-2 px-3 text-sm font-semibold"
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
              <div className="col-span-full text-center py-16 border border-dark-700 rounded-2xl bg-dark-800/30">
                <FiCheckCircle className="text-4xl text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">All fees are collected! 🎉</p>
              </div>
            ) : unpaidPayments.map((payment, idx) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-dark-800 to-dark-900 border border-red-500/30 hover:border-red-400/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 group"
              >
                {/* Payment Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors flex-1">
                      {payment.user?.name || 'Unknown'}
                    </h3>
                    <span className="text-xl font-bold text-red-400 whitespace-nowrap">₹{payment.amount}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{payment.month} {payment.year}</p>
                </div>

                {/* Student Details Card */}
                <div className="space-y-2 text-sm bg-dark-900/50 rounded-lg p-4 mb-4">
                  <div>
                    <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Email</p>
                    <p className="text-gray-300 break-all text-xs">{payment.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Contact</p>
                    <p className="text-white font-medium text-xs">{payment.user?.contact || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Sport</p>
                    <p className="text-primary font-bold text-xs">
                      {Array.isArray(payment.user?.sports)
                        ? payment.user.sports.join(', ')
                        : (payment.user?.sports || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold text-xs uppercase mb-1">Age</p>
                    <p className="text-white font-medium text-xs">{payment.user?.age || 'N/A'} years</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-dark-700">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold border bg-red-500/15 text-red-400 border-red-500/30 inline-flex items-center gap-1 whitespace-nowrap">
                    <FiAlertCircle size={14} /> {payment.status === 'rejected' ? 'Rejected' : 'Unpaid'}
                  </span>
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
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-3">Generate Monthly Fee</h2>
              <p className="text-gray-400 mb-8">This will create a new payment record for all currently approved students for the specified month.</p>

              <form onSubmit={generatePayments} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3">Month</label>
                  <select
                    value={generateForm.month}
                    onChange={e => setGenerateForm({ ...generateForm, month: e.target.value })}
                    className="w-full bg-dark-900 border border-dark-700 hover:border-primary/50 focus:border-primary outline-none text-white rounded-lg px-4 py-3 transition-colors"
                  >
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-3">Year</label>
                    <input
                      type="number"
                      value={generateForm.year}
                      onChange={e => setGenerateForm({ ...generateForm, year: e.target.value })}
                      className="w-full bg-dark-900 border border-dark-700 hover:border-primary/50 focus:border-primary outline-none text-white rounded-lg px-4 py-3 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-3">Amount (₹)</label>
                    <input
                      type="number"
                      value={generateForm.amount}
                      onChange={e => setGenerateForm({ ...generateForm, amount: e.target.value })}
                      className="w-full bg-dark-900 border border-dark-700 hover:border-primary/50 focus:border-primary outline-none text-white rounded-lg px-4 py-3 transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:brightness-110 text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/50"
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
