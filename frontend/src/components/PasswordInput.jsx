import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Password field with a show/hide toggle.
//
// The toggle is type="button" so it can never submit the surrounding form, and
// it is announced to screen readers through aria-label/aria-pressed rather than
// relying on the icon. Visibility is local state, so each field toggles
// independently and nothing is persisted.
export default function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const label = visible ? 'Hide password' : 'Show password';

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-content-muted
          hover:text-content focus:text-primary outline-none transition-colors"
      >
        {visible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
      </button>
    </div>
  );
}
