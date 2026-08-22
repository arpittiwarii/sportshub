import { useState } from 'react';
import { FiX, FiUploadCloud, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AlertBox from './AlertBox';

const UploadModal = ({ isOpen, paymentId, onClose, onUpload, loading = false, isResubmit = false }) => {
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
        setFile(droppedFile);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
      } else {
        toast.error('Please select an image file (JPG, PNG, etc.)');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.warning('Please select an image file');
      return;
    }

    await onUpload(paymentId, file, transactionId);

    // Reset form
    setFile(null);
    setTransactionId('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // z-[60] clears the z-50 navbar, and the flex overlay keeps the panel
        // inside the window on short screens instead of overflowing it.
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md max-h-full overflow-y-auto"
          >
            <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-content">
                  {isResubmit ? 'Re-submit Payment Proof' : 'Upload Payment Proof'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-content-muted hover:text-content transition-colors p-1 rounded hover:bg-surface-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {isResubmit && (
                <p className="text-content-muted text-sm -mt-3 mb-4">
                  This replaces the proof you submitted earlier and sends the payment back for review.
                </p>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* File Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                    transition-all duration-300
                    ${
                      dragActive
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-border bg-surface-2/50 hover:border-primary/50'
                    }
                  `}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />

                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="bg-primary/20 p-4 rounded-full">
                        <FiUploadCloud className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-content font-medium">
                        {file ? file.name : 'Choose or drag file here'}
                      </p>
                      <p className="text-content-muted text-sm mt-1">
                        {file ? `${(file.size / 1024).toFixed(2)} KB` : 'JPG, PNG up to 5MB'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Preview */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg overflow-hidden bg-surface-2 p-2"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  </motion.div>
                )}

                {/* Transaction ID Input */}
                <div>
                  <label className="block text-sm font-medium text-content-muted mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g., TXN123456789"
                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2 text-content placeholder-content-subtle focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  />
                  <p className="text-content-subtle text-xs mt-1">
                    Helps us track your payment faster
                  </p>
                </div>

                {/* Info */}
                <AlertBox variant="primary" icon={FiAlertCircle}>
                  <p className="text-sm">
                    Upload a clear screenshot of your UPI/PhonePe payment receipt showing the payment amount and transaction ID.
                  </p>
                </AlertBox>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-surface-2 text-content rounded-lg hover:bg-surface-2/70 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!file || loading}
                    className="flex-1 px-4 py-2 btn-primary rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-contrast"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUploadCloud className="w-4 h-4" />
                        {isResubmit ? 'Re-submit Proof' : 'Upload Proof'}
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
  );
};

export default UploadModal;
