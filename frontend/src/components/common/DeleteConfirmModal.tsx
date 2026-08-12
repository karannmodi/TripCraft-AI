import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  tripTitle?: string;
  title?: string;
  message?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  tripTitle,
  title = 'Confirm Deletion',
  message,
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="delete-dialog-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1rem'
      }}
    >
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
            <AlertTriangle size={24} />
            <h3 id="delete-dialog-title" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            aria-label="Close Dialog"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
          {message || (
            <>Are you sure you want to delete <strong style={{ color: 'var(--text-main)' }}>"{tripTitle}"</strong>? This will permanently remove the record.</>
          )}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isDeleting}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
