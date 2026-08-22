import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiDollarSign, FiAlertCircle, FiQrCode } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import PaymentTable from '../components/PaymentTable';
import UploadModal from '../components/UploadModal';
import ScreenshotModal from '../components/ScreenshotModal';
import AlertBox from '../components/AlertBox';

const StudentPaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, paymentId: null });
  const [screenshotModal, setScreenshotModal] = useState({ isOpen: false, imageUrl: null, caption: null });
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr).id : null;

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/my-fees');
      setPayments(response.data?.data || response.data);
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
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchPayments();
    // eslint-disable-next-line
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUploadClick = (paymentId) => {
    const payment = payments.find((p) => p.id === paymentId);
    setUploadModal({ isOpen: true, paymentId, isResubmit: Boolean(payment?.submittedAt) });
  };

  const handleViewScreenshot = (screenshotUrl, payment) => {
    setScreenshotModal({
      isOpen: true,
      imageUrl: screenshotUrl,
      caption: payment ? `${payment.month} ${payment.year} · ₹${payment.amount}` : null,
    });
  };

  const handleUploadSubmit = async (paymentId, file, transactionId) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      if (transactionId) {
        formData.append('transactionId', transactionId);
      }

      await api.put(`/payments/${paymentId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('✓ Payment proof uploaded successfully!');
      setUploadModal({ isOpen: false, paymentId: null });
      fetchPayments();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  // Calculate statistics (backend returns UPPERCASE statuses)
  const stats = {
    total: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    approved: payments.reduce((sum, p) => p.status === 'APPROVED' ? sum + (p.amount || 0) : sum, 0),
    pending: payments.filter(p => p.status === 'PENDING').length,
    rejected: payments.filter(p => p.status === 'REJECTED').length
  };

  const steps = [
    { title: 'Scan the QR code with your phone', desc: 'Use PhonePe, Google Pay, or any UPI app' },
    { title: 'Enter the amount', desc: 'Check the pending amount below' },
    { title: 'Upload payment proof', desc: 'Click "Upload Payment Proof" button and submit screenshot' },
    { title: 'Wait for verification', desc: 'Admin will review and mark it as approved' },
  ];

  const statTiles = [
    { label: 'Total Fees', value: `₹${stats.total}`, tone: 'text-primary' },
    { label: 'Approved', value: `₹${stats.approved}`, tone: 'text-success' },
    { label: 'Pending', value: stats.pending, tone: 'text-steel' },
    { label: 'Rejected', value: stats.rejected, tone: 'text-danger' },
  ];

  return (
    <div className="min-h-screen page-shell pb-16 bg-gradient-to-b from-bg via-bg to-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center text-primary-contrast text-2xl shadow-lg shadow-primary/40">
              <FiDollarSign />
            </div>
            <div>
              <p className="eyebrow">Athlete Portal</p>
              <h1 className="text-3xl font-display text-content">Payment History</h1>
              <p className="text-content-muted">Manage your academy fee payments</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-danger hover:bg-danger/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-danger/20"
          >
            <FiLogOut /> Logout
          </button>
        </div>

        {/* QR Code & Payment Instructions Card */}
        <div className="glass-panel p-8 mb-8 border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Cpath fill='black' d='M10,10h30v30H10V10M50,10h30v30H50V10M90,10h30v30H90V10M130,10h30v30H130V10M170,10h20v30H170V10M10,50h20v30H10V50M50,50h30v30H50V50M90,50h30v30H90V50M130,50h20v30H130V50M170,50h20v30H170V50M10,90h30v20H10V90M50,90h20v20H50V90M90,90h30v20H90V90M130,90h20v20H130V90M170,90h20v20H170V90M10,130h20v20H10V130M50,130h30v20H50V130M90,130h20v20H90V130M130,130h30v20H130V130M170,130h20v20H170V130M10,170h30v20H10V170M50,170h30v20H50V170M90,170h20v20H90V170M130,170h30v20H130V170M170,170h20v20H170V170'/%3E%3C/svg%3E"
                  alt="Payment QR Code"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-sm text-content-muted">PhonePe/UPI QR Code</p>
            </div>

            {/* Payment Details Section */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-content mb-4 flex items-center gap-2">
                  <FiQrCode className="text-primary" />
                  How to Pay Your Fees
                </h3>
              </div>

              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-contrast font-display font-bold text-sm flex-shrink-0 tabular-nums">{i + 1}</div>
                    <div>
                      <p className="font-medium text-content">{step.title}</p>
                      <p className="text-sm text-content-muted">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <AlertBox variant="primary" icon={FiAlertCircle} className="mt-4">
                <p className="text-sm">
                  Make sure to upload a clear screenshot showing the transaction amount and confirmation
                </p>
              </AlertBox>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statTiles.map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <p className="text-content-muted text-sm mb-2">{stat.label}</p>
              <p className={`text-2xl font-display font-bold tabular-nums ${stat.tone}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Payments Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-display text-content mb-6">Your Payments</h2>
          <PaymentTable
            payments={payments}
            isAdmin={false}
            onUpload={handleUploadClick}
            onViewScreenshot={handleViewScreenshot}
            loading={loading}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModal.isOpen}
        paymentId={uploadModal.paymentId}
        isResubmit={uploadModal.isResubmit}
        onClose={() => setUploadModal({ isOpen: false, paymentId: null })}
        onUpload={handleUploadSubmit}
        loading={uploading}
      />

      {/* Screenshot Preview Modal */}
      <ScreenshotModal
        isOpen={screenshotModal.isOpen}
        imageUrl={screenshotModal.imageUrl}
        caption={screenshotModal.caption}
        title="Your Payment Proof"
        onClose={() => setScreenshotModal({ isOpen: false, imageUrl: null, caption: null })}
      />
    </div>
  );
};

export default StudentPaymentPage;
