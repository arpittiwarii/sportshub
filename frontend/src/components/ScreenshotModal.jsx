import { useEffect, useState } from 'react';
import { FiExternalLink, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const iconButton =
  'p-2 rounded-lg text-content-muted hover:text-content hover:bg-surface-2 transition-colors';

// Panel lives in its own component so each open (and each new screenshot)
// mounts it fresh — the zoom always starts fitted, no reset effect needed.
const ScreenshotPanel = ({ imageUrl, onClose, title, caption }) => {
  const [actualSize, setActualSize] = useState(false);

  // Escape closes; background scroll is locked while the modal is up.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    // z-[60] clears the z-50 navbar — the old backdrop sat below it.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Panel — max-h-full keeps it inside the window on any screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex w-full max-w-4xl max-h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-2/60 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold uppercase tracking-wider text-content">
              {title}
            </p>
            {caption && <p className="truncate text-xs text-content-muted">{caption}</p>}
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setActualSize((v) => !v)}
              className={iconButton}
              title={actualSize ? 'Fit to window' : 'View actual size'}
              aria-label={actualSize ? 'Fit to window' : 'View actual size'}
            >
              {actualSize ? <FiMinimize2 className="h-5 w-5" /> : <FiMaximize2 className="h-5 w-5" />}
            </button>
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className={iconButton}
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <FiExternalLink className="h-5 w-5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className={iconButton}
              title="Close"
              aria-label="Close"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Image area — flex-1 + min-h-0 lets it shrink to whatever the window
            leaves over, instead of pushing the panel off-screen. */}
        <div
          className={`min-h-0 flex-1 bg-black/20 ${
            actualSize ? 'overflow-auto' : 'flex items-center justify-center overflow-hidden p-2'
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className={actualSize ? 'max-w-none' : 'max-h-full max-w-full object-contain'}
            />
          ) : (
            <p className="p-10 text-center text-content-muted">No screenshot available</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Payment proofs come straight off a phone, so they can be far taller (or
// wider) than the window. The panel is capped to the viewport and the image is
// contained inside it, so "View" always fits the window whatever was uploaded.
// "Actual size" opts into scrolling when a small transaction ID needs reading.
const ScreenshotModal = ({ isOpen, imageUrl, onClose, title = 'Payment Screenshot', caption }) => (
  <AnimatePresence>
    {isOpen && (
      <ScreenshotPanel
        key={imageUrl || 'screenshot'}
        imageUrl={imageUrl}
        onClose={onClose}
        title={title}
        caption={caption}
      />
    )}
  </AnimatePresence>
);

export default ScreenshotModal;
