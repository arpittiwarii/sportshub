import { FiEye, FiUploadCloud, FiCheck, FiX } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import { motion } from 'framer-motion';

const PaymentTable = ({
  payments,
  isAdmin = false,
  onUpload,
  onApprove,
  onReject,
  onViewScreenshot,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-400 mt-4">Loading payments...</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <p className="text-gray-400 text-lg">No payments found</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700 bg-dark-800/50">
              {isAdmin && <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Student Name</th>}
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Month</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Year</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Status</th>
              {isAdmin && <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Screenshot</th>}
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, idx) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-dark-700 hover:bg-dark-800/50 transition-colors duration-300 group"
              >
                {isAdmin && (
                  <td className="px-6 py-4 text-sm text-gray-300 font-medium">
                    {payment.user?.name || 'Unknown'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-300">
                  {payment.month}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {payment.year}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  ₹{payment.amount}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={payment.status} />
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    {payment.screenshot ? (
                      <button
                        onClick={() => onViewScreenshot(payment.screenshot)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded hover:bg-blue-500/10"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">Not uploaded</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!isAdmin && (payment.status === 'PENDING' || payment.status === 'REJECTED') && (
                      <button
                        onClick={() => onUpload(payment.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all duration-300 text-xs font-medium hover:scale-105"
                      >
                        <FiUploadCloud className="w-4 h-4" />
                        Upload
                      </button>
                    )}
                    {isAdmin && payment.status === 'PENDING' && payment.submittedAt && (
                      <>
                        <button
                          onClick={() => onApprove(payment.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-all duration-300 text-xs font-medium hover:scale-105"
                          title="Approve payment"
                        >
                          <FiCheck className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(payment.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all duration-300 text-xs font-medium hover:scale-105"
                          title="Reject payment"
                        >
                          <FiX className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {payments.map((payment, idx) => (
          <motion.div
            key={payment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-dark-800 rounded-lg p-4 space-y-3 border border-dark-700"
          >
            {isAdmin && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Student</span>
                <span className="font-medium text-white">{payment.athleteId?.name || 'Unknown'}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-xs">Month</span>
                <p className="font-medium text-white">{payment.month}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Year</span>
                <p className="font-medium text-white">{payment.year}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Amount</span>
                <p className="font-semibold text-primary">₹{payment.amount}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Status</span>
                <div className="mt-1">
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            </div>

            {isAdmin && payment.screenshot && (
              <button
                onClick={() => onViewScreenshot(payment.screenshot)}
                className="w-full flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded bg-blue-500/5 border border-blue-500/20 mt-2"
              >
                <FiEye className="w-4 h-4" />
                View Screenshot
              </button>
            )}

            <div className="flex gap-2 mt-3 flex-wrap">
              {!isAdmin && (payment.status === 'PENDING' || payment.status === 'REJECTED') && (
                <button
                  onClick={() => onUpload(payment.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all duration-300 text-xs font-medium"
                >
                  <FiUploadCloud className="w-4 h-4" />
                  Upload
                </button>
              )}
              {isAdmin && payment.status === 'PENDING' && payment.screenshot && (
                <>
                  <button
                    onClick={() => onApprove(payment._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-all duration-300 text-xs font-medium"
                  >
                    <FiCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(payment._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all duration-300 text-xs font-medium"
                  >
                    <FiX className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PaymentTable;
