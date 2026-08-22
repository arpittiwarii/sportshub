import { FiEye, FiUploadCloud, FiCheck, FiX } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
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
        <p className="text-content-muted mt-4">Loading payments...</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <p className="text-content-muted text-lg">No payments found</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-2/40">
              {isAdmin && <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-content-muted">Student Name</th>}
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-content-muted">Month</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-content-muted">Year</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-content-muted">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-content-muted">Status</th>
              {isAdmin && <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-content-muted">Screenshot</th>}
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-content-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, idx) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-border hover:bg-surface-2/40 transition-colors duration-300 group"
              >
                {isAdmin && (
                  <td className="px-6 py-4 text-sm text-content-muted font-medium">
                    {payment.user?.name || 'Unknown'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-content-muted">
                  {payment.month}
                </td>
                <td className="px-6 py-4 text-sm text-content-muted">
                  {payment.year}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-primary tabular-nums">
                  ₹{payment.amount}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={payment.status} />
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    {payment.screenshot ? (
                      <ActionButton variant="view" icon={FiEye} onClick={() => onViewScreenshot(payment.screenshot)}>
                        View
                      </ActionButton>
                    ) : (
                      <span className="text-content-subtle text-xs">Not uploaded</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!isAdmin && (payment.status === 'PENDING' || payment.status === 'REJECTED') && (
                      <ActionButton variant="upload" icon={FiUploadCloud} onClick={() => onUpload(payment.id)}>
                        Upload
                      </ActionButton>
                    )}
                    {isAdmin && payment.status === 'PENDING' && payment.submittedAt && (
                      <>
                        <ActionButton variant="approve" icon={FiCheck} onClick={() => onApprove(payment.id)} title="Approve payment">
                          Approve
                        </ActionButton>
                        <ActionButton variant="reject" icon={FiX} onClick={() => onReject(payment.id)} title="Reject payment">
                          Reject
                        </ActionButton>
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
            key={payment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface rounded-lg p-4 space-y-3 border border-border"
          >
            {isAdmin && (
              <div className="flex items-center justify-between">
                <span className="text-content-subtle text-xs">Student</span>
                <span className="font-medium text-content">{payment.user?.name || 'Unknown'}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-content-subtle text-xs">Month</span>
                <p className="font-medium text-content">{payment.month}</p>
              </div>
              <div>
                <span className="text-content-subtle text-xs">Year</span>
                <p className="font-medium text-content">{payment.year}</p>
              </div>
              <div>
                <span className="text-content-subtle text-xs">Amount</span>
                <p className="font-semibold text-primary tabular-nums">₹{payment.amount}</p>
              </div>
              <div>
                <span className="text-content-subtle text-xs">Status</span>
                <div className="mt-1">
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            </div>

            {isAdmin && payment.screenshot && (
              <ActionButton
                variant="view"
                icon={FiEye}
                onClick={() => onViewScreenshot(payment.screenshot)}
                className="w-full"
              >
                View Screenshot
              </ActionButton>
            )}

            <div className="flex gap-2 mt-3 flex-wrap">
              {!isAdmin && (payment.status === 'PENDING' || payment.status === 'REJECTED') && (
                <ActionButton variant="upload" icon={FiUploadCloud} onClick={() => onUpload(payment.id)} className="flex-1">
                  Upload
                </ActionButton>
              )}
              {isAdmin && payment.status === 'PENDING' && payment.submittedAt && (
                <>
                  <ActionButton variant="approve" icon={FiCheck} onClick={() => onApprove(payment.id)} className="flex-1">
                    Approve
                  </ActionButton>
                  <ActionButton variant="reject" icon={FiX} onClick={() => onReject(payment.id)} className="flex-1">
                    Reject
                  </ActionButton>
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
