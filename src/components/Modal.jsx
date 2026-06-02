import { useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, children, size = 'medium', showCloseButton = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-container ${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export default Modal;
