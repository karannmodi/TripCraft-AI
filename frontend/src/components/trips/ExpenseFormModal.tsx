import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCreateInput } from '../../types/trip';
import { X } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreateInput) => Promise<void>;
  initialData?: Expense | null;
}

const EXPENSE_CATEGORIES = ['Lodging', 'Transportation', 'Food', 'Activities', 'Shopping', 'Other'];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [category, setCategory] = useState('Lodging');
  const [description, setDescription] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('0.00');
  const [actualAmount, setActualAmount] = useState('0.00');
  const [expenseDate, setExpenseDate] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Lodging');
      setDescription(initialData.description || '');
      setEstimatedAmount(initialData.estimated_amount ? String(initialData.estimated_amount) : '0.00');
      setActualAmount(initialData.actual_amount ? String(initialData.actual_amount) : '0.00');
      setExpenseDate(initialData.expense_date || '');
      setIsPaid(initialData.is_paid || false);
    } else {
      setCategory('Lodging');
      setDescription('');
      setEstimatedAmount('0.00');
      setActualAmount('0.00');
      setExpenseDate('');
      setIsPaid(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Expense description cannot be blank.');
      return;
    }

    const numEst = parseFloat(estimatedAmount);
    if (isNaN(numEst) || numEst < 0) {
      setError('Estimated amount must be a non-negative number.');
      return;
    }

    const numAct = parseFloat(actualAmount);
    if (isNaN(numAct) || numAct < 0) {
      setError('Actual amount must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        category,
        description: description.trim(),
        estimated_amount: numEst.toFixed(2),
        actual_amount: numAct.toFixed(2),
        expense_date: expenseDate || null,
        is_paid: isPaid
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1100 }}>
      <div className="card" style={{ maxWidth: '550px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
            {initialData ? 'Edit Expense' : 'Add New Expense'}
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
          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Category *
            </label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Description *
            </label>
            <input
              type="text"
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Hotel stay, Flight ticket, Dinner at Lou Malnati's"
              required
            />
          </div>

          {/* Estimated Amount & Actual Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Estimated Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Actual Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Expense Date & Paid Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Expense Date
              </label>
              <input
                type="date"
                className="input-field"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div style={{ paddingTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                />
                <span>Mark as Paid</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
