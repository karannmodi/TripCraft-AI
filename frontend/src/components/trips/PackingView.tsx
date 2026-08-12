import React, { useState, useEffect } from 'react';
import { Trip, PackingItem, PackingItemCreateInput } from '../../types/trip';
import { fetchPackingItems, generatePackingList, createPackingItem, updatePackingItem, deletePackingItem } from '../../api/client';
import { PackingFormModal } from './PackingFormModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { Plus, Sparkles, Package, Edit, Trash2, CheckSquare, Square } from 'lucide-react';

interface PackingViewProps {
  trip: Trip;
}

const CATEGORY_ORDER = [
  'Clothing',
  'Documents',
  'Electronics',
  'Toiletries',
  'Activity-specific items',
  'Miscellaneous'
];

export const PackingView: React.FC<PackingViewProps> = ({ trip }) => {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const loadPackingList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPackingItems(trip.id);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load packing items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      loadPackingList();
    }
  }, [trip?.id]);

  const handleTogglePacked = async (item: PackingItem) => {
    try {
      const updated = await updatePackingItem(item.id, { is_packed: !item.is_packed });
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    } catch (err: any) {
      setError(err.message || 'Failed to update item.');
    }
  };

  const handleSaveItem = async (input: PackingItemCreateInput) => {
    if (editingItem) {
      await updatePackingItem(editingItem.id, input);
    } else {
      await createPackingItem(trip.id, input);
    }
    await loadPackingList();
  };

  const handleDeleteItem = async () => {
    if (deletingId) {
      await deletePackingItem(deletingId);
      setDeletingId(null);
      await loadPackingList();
    }
  };

  const handleGenerateAI = async (overwrite: boolean = false) => {
    const aiItemsExist = items.some(i => i.is_ai_suggested);
    if (aiItemsExist && !overwrite) {
      setShowRegenerateConfirm(true);
      return;
    }

    setGenerating(true);
    setError(null);
    setShowRegenerateConfirm(false);
    try {
      const updatedList = await generatePackingList(trip.id, overwrite);
      setItems(updatedList);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI packing list.');
    } finally {
      setGenerating(false);
    }
  };

  const totalItems = items.length;
  const packedCount = items.filter(i => i.is_packed).length;
  const packedPercent = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  // Group items by category
  const groupedItems = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  // Collect any uncategorized items into Miscellaneous
  const otherItems = items.filter(i => !CATEGORY_ORDER.includes(i.category));
  if (otherItems.length > 0) {
    groupedItems['Miscellaneous'] = [...(groupedItems['Miscellaneous'] || []), ...otherItems];
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
            Packing Assistant
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            AI-suggested packing checklist tailored for {trip.destination}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleGenerateAI(false)}
            disabled={generating}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 0.9rem', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
          >
            {generating ? (
              <>
                <div className="spinner" style={{ width: '14px', height: '14px' }} />
                Generating AI List...
              </>
            ) : (
              <>
                <Sparkles size={16} /> {items.some(i => i.is_ai_suggested) ? 'Regenerate AI Items' : 'Generate AI Packing List'}
              </>
            )}
          </button>
          <button
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
          >
            <Plus size={16} /> Add Custom Item
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Packing Progress</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
              {packedCount} of {totalItems} items packed ({packedPercent}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${packedPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }} />
          Loading packing list...
        </div>
      ) : totalItems === 0 ? (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '0.75rem', border: '1px border-dashed rgba(255, 255, 255, 0.1)' }}>
          <Package size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.5 }} />
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Your Packing List is Empty</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Let local AI (gemma3:1b) analyze your trip activities and destination to generate a smart checklist.
          </p>
          <button
            onClick={() => handleGenerateAI(false)}
            disabled={generating}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
          >
            <Sparkles size={16} /> Generate AI Packing List
          </button>
        </div>
      ) : (
        /* Categorized Items List */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
          {CATEGORY_ORDER.map(cat => {
            const catItems = groupedItems[cat] || [];
            if (catItems.length === 0) return null;
            const catPackedCount = catItems.filter(i => i.is_packed).length;

            return (
              <div
                key={cat}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1.25rem'
                }}
              >
                {/* Category Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    {cat}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(15, 23, 42, 0.6)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                    {catPackedCount}/{catItems.length} packed
                  </span>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: item.is_packed ? 'rgba(34, 197, 94, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                        border: item.is_packed ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Left: Checkbox & Name */}
                      <div
                        onClick={() => handleTogglePacked(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flex: 1 }}
                      >
                        {item.is_packed ? (
                          <CheckSquare size={18} style={{ color: '#34d399', flexShrink: 0 }} />
                        ) : (
                          <Square size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: item.is_packed ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: item.is_packed ? 'line-through' : 'none',
                            fontWeight: item.is_packed ? 400 : 500
                          }}
                        >
                          {item.item_name}
                        </span>
                      </div>

                      {/* Right: Badge & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {item.is_ai_suggested ? (
                          <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                            AI Suggested
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            Custom
                          </span>
                        )}

                        <button
                          onClick={() => { setEditingItem(item); setIsFormOpen(true); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                          title="Edit Item"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.2rem' }}
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <PackingFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSubmit={handleSaveItem}
        initialData={editingItem}
      />

      {/* Delete Item Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        title="Delete Packing Item"
        message="Are you sure you want to delete this item from your packing checklist?"
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteItem}
      />

      {/* Regenerate AI Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showRegenerateConfirm}
        title="Regenerate AI Packing List"
        message="Regenerating will replace existing AI-suggested items with a fresh list. All manually added custom items and their packed status will remain intact."
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={() => handleGenerateAI(true)}
      />
    </div>
  );
};
