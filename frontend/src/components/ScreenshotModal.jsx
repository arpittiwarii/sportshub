import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ScreenshotModal = ({ isOpen, imageUrl, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 mx-4"
          >
            <div className="relative bg-surface rounded-xl overflow-hidden shadow-2xl border border-border">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-surface-2 hover:bg-surface text-content p-2 rounded-lg transition-colors z-10"
              >
                <FiX className="w-6 h-6" />
              </button>

              {/* Image */}
              <img
                src={imageUrl}
                alt="Payment Screenshot"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScreenshotModal;
