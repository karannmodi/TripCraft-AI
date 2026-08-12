import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = "Loading..." }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }} role="status">
      <div className="spinner" aria-hidden="true" />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{label}</span>
    </div>
  );
};
