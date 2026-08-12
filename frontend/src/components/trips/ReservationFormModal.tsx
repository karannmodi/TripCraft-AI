import React, { useState, useEffect } from 'react';
import { Reservation, ReservationCreateInput } from '../../types/trip';
import { X } from 'lucide-react';

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationCreateInput) => Promise<void>;
  initialData?: Reservation | null;
}

const RESERVATION_TYPES = ['Lodging', 'Transportation', 'Restaurant', 'Activity'];

export const ReservationFormModal: React.FC<ReservationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [type, setType] = useState('Lodging');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [cost, setCost] = useState('0.00');
  const [status, setStatus] = useState('Confirmed');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'Lodging');
      setTitle(initialData.title || '');
      setProvider(initialData.provider || '');
      setConfirmationCode(initialData.confirmation_code || '');
      setStartTime(initialData.start_time ? initialData.start_time.slice(0, 16) : '');
      setEndTime(initialData.end_time ? initialData.end_time.slice(0, 16) : '');
      setCost(initialData.cost ? String(initialData.cost) : '0.00');
      setStatus(initialData.status || 'Confirmed');
      setNotes(initialData.notes || '');
    } else {
      setType('Lodging');
      setTitle('');
      setProvider('');
      setConfirmationCode('');
      setStartTime('');
      setEndTime('');
      setCost('0.00');
      setStatus('Confirmed');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!title.trim()) {
      setError('Reservation title cannot be blank.');
      return;
    }

    const numCost = parseFloat(cost);
    if (isNaN(numCost) || numCost < 0) {
      setError('Cost must be a non-negative number.');
      return;
    }

    if (startTime && endTime && new Date(endTime) < new Date(startTime)) {
      setError('End date/time cannot be before start date/time.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        provider: provider.trim() || null,
        confirmation_code: confirmationCode.trim() || null,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        cost: numCost.toFixed(2),
        status,
        notes: notes.trim() || null
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1100 }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
            {initialData ? 'Edit Reservation' : 'Add New Reservation'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Reservation Type & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Type *
              </label>
              <select className="input-field" value={type} onChange={(e) => setType(e.target.value)} required>
                {RESERVATION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Status
              </label>
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Title / Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chicago Hotel or Architecture River Cruise"
              required
            />
          </div>

          {/* Provider & Confirmation Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Provider
              </label>
              <input
                type="text"
                className="input-field"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Marriott, First Lady Tours"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Confirmation Code
              </label>
              <input
                type="text"
                className="input-field"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="e.g. CONF-8892"
              />
            </div>
          </div>

          {/* Start and End Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Start Date / Time
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                End Date / Time
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Notes / Special Instructions
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Check-in details, booking policies, notes..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Reservation' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
