import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiDollarSign } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import PaymentTable from '../components/PaymentTable';
import FilterTabs from '../components/FilterTabs';
import ScreenshotModal from '../components/ScreenshotModal';

const AdminPaymentPage = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [screenshotModal, setScreenshotModal] = useState({ isOpen: false, imageUrl: null });
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const userRole = userStr ? JSON.parse(userStr).role : null;

  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'ADMIN') {
      navigate('/');
      toast.error('Access denied');
    }
  }, [userRole, navigate]);

  // Fetch all payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      const allPayments = response.data?.data || response.data;
      setAllPayments(allPayments);
      applyFilter('all', allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error('Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Apply filter
  const applyFilter = (filter, payments = allPayments) => {
    setActiveFilter(filter);

    let filtered = [...payments];
    if (filter !== 'all') {
      filtered = filtered.filter(p => p.status === filter.toUpperCase());
    }

    setFilteredPayments(filtered);
  };

  const handleFilterChange = (filter) => {
    applyFilter(filter);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleApprovePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to approve this payment?')) {
      setProcessingId(paymentId);
      try {
        await api.put(`/payments/${paymentId}/verify`, { status: 'APPROVED' });
        toast.success('✓ Payment approved successfully!');
        fetchPayments();
      } catch (error) {
        console.error('Error approving payment:', error);
        toast.error(error.response?.data?.message || 'Failed to approve payment');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to reject this payment?')) {
      setProcessingId(paymentId);
      try {
        await api.put(`/payments/${paymentId}/verify`, { status: 'REJECTED' });
        toast.success('✓ Payment rejected');
        fetchPayments();
      } catch (error) {
        console.error('Error rejecting payment:', error);
        toast.error(error.response?.data?.message || 'Failed to reject payment');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleViewScreenshot = (screenshotUrl) => {
    setScreenshotModal({
      isOpen: true,
      imageUrl: screenshotUrl?.startsWith('http')
        ? screenshotUrl
        : `https://sportshub-backend-mzth.onrender.com${screenshotUrl}`,
    });
  };

  // Calculate statistics
  const stats = {
    total: allPayments.length,
    pending: allPayments.filter(p => p.status === 'PENDING').length,
    approved: allPayments.filter(p => p.status === 'APPROVED').length,
    rejected: allPayments.filter(p => p.status === 'REJECTED').length,
    withScreenshot: allPayments.filter(p => p.screenshot).length,
    needsReview: allPayments.filter(p => p.status === 'PENDING' && p.submittedAt).length
  };

  const statTiles = [
    { label: 'Total', value: stats.total, tone: 'text-primary' },
    { label: 'Pending', value: stats.pending, tone: 'text-steel' },
    { label: 'Approved', value: stats.approved, tone: 'text-success' },
    { label: 'Rejected', value: stats.rejected, tone: 'text-danger' },
    { label: 'With Proof', value: stats.withScreenshot, tone: 'text-steel' },
    { label: 'Review Needed', value: stats.needsReview, tone: 'text-primary' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-bg via-bg to-surface">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center text-primary-contrast text-2xl shadow-lg shadow-primary/40">
              <FiDollarSign />
            </div>
            <div>
              <p className="eyebrow">Management Center</p>
              <h1 className="text-3xl font-display text-content">Payment Management</h1>
              <p className="text-content-muted">Verify and manage athletes' payments</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-danger hover:bg-danger/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-danger/20"
          >
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {statTiles.map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel p-3 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <p className="text-content-muted text-xs mb-1">{stat.label}</p>
              <p className={`text-2xl font-display font-bold tabular-nums ${stat.tone}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={{
            all: stats.total,
            pending: stats.pending,
            approved: stats.approved,
            rejected: stats.rejected
          }}
        />

        {/* Payments Table */}
        <div>
          <h2 className="text-2xl font-display text-content mb-6">
            {activeFilter === 'all' && 'All Payments'}
            {activeFilter === 'pending' && `Pending Review (${stats.needsReview})`}
            {activeFilter === 'approved' && `Approved Payments (${stats.approved})`}
            {activeFilter === 'rejected' && `Rejected Payments (${stats.rejected})`}
          </h2>

          <PaymentTable
            payments={filteredPayments}
            isAdmin={true}
            onApprove={handleApprovePayment}
            onReject={handleRejectPayment}
            onViewScreenshot={handleViewScreenshot}
            loading={loading}
          />
        </div>

        {/* Help Section */}
        {stats.needsReview > 0 && (
          <div className="glass-panel p-6 mt-8 border border-primary/30 bg-primary/5">
            <h3 className="text-lg font-bold text-content mb-3">⚠️ Action Required</h3>
            <p className="text-content-muted">
              You have <span className="font-bold text-primary">{stats.needsReview}</span> pending payment{stats.needsReview !== 1 ? 's' : ''} with proof that need verification. Review them above and approve or reject.
            </p>
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      <ScreenshotModal
        isOpen={screenshotModal.isOpen}
        imageUrl={screenshotModal.imageUrl}
        onClose={() => setScreenshotModal({ isOpen: false, imageUrl: null })}
      />
    </div>
  );
};

export default AdminPaymentPage;
