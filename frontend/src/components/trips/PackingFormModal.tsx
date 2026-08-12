import React, { useState, useEffect } from 'react';
import { PackingItem, PackingItemCreateInput } from '../../types/trip';
import { X } from 'lucide-react';

interface PackingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackingItemCreateInput) => Promise<void>;
  initialData?: PackingItem | null;
}

const PACKING_CATEGORIES = [
  'Clothing',
  'Documents',
  'Electronics',
  'Toiletries',
  'Activity-specific items',
  'Miscellaneous'
];

export const PackingFormModal: React.FC<PackingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [category, setCategory] = useState('Clothing');
  const [itemName, setItemName] = useState('');
  const [isPacked, setIsPacked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Clothing');
      setItemName(initialData.item_name || '');
      setIsPacked(initialData.is_packed || false);
    } else {
      setCategory('Clothing');
      setItemName('');
      setIsPacked(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemName.trim()) {
      setError('Item description cannot be blank.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        category,
        item_name: itemName.trim(),
        is_packed: isPacked
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save packing item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1100 }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
            {initialData ? 'Edit Packing Item' : 'Add Custom Item'}
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
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Category *
            </label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {PACKING_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Item Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Rain Jacket, Passport, Camera Charger"
              required
            />
          </div>

          <div style={{ paddingTop: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={isPacked}
                onChange={(e) => setIsPacked(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
              />
              <span>Mark as Packed</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
