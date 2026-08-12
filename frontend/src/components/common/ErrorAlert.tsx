import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ title = "Error", message }) => {
  return (
    <div 
      className="card" 
      style={{ 
        borderColor: 'var(--error-border)', 
        background: 'var(--error-bg)',
        color: 'var(--error-text)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}
      role="alert"
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong style={{ display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>{title}</strong>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>{message}</p>
      </div>
    </div>
  );
};
