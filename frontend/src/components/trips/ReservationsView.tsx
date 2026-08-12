import React, { useState, useEffect } from 'react';
import { Trip, Reservation, ReservationCreateInput } from '../../types/trip';
import { fetchReservations, createReservation, updateReservation, deleteReservation } from '../../api/client';
import { ReservationFormModal } from './ReservationFormModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { Plus, Hotel, Car, Utensils, Ticket, Edit, Trash2, Calendar, Tag, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ReservationsViewProps {
  trip: Trip;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({ trip }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReservations(trip.id);
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      loadReservations();
    }
  }, [trip?.id]);

  const handleSave = async (input: ReservationCreateInput) => {
    if (editingReservation) {
      await updateReservation(editingReservation.id, input);
    } else {
      await createReservation(trip.id, input);
    }
    await loadReservations();
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteReservation(deletingId);
      setDeletingId(null);
      await loadReservations();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Lodging':
        return <Hotel size={18} style={{ color: '#38bdf8' }} />;
      case 'Transportation':
        return <Car size={18} style={{ color: '#a78bfa' }} />;
      case 'Restaurant':
        return <Utensils size={18} style={{ color: '#f43f5e' }} />;
      case 'Activity':
        return <Ticket size={18} style={{ color: '#34d399' }} />;
      default:
        return <Tag size={18} style={{ color: 'var(--accent-cyan)' }} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle size={12} /> Confirmed
          </span>
        );
      case 'Pending':
        return (
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> Pending
          </span>
        );
      default:
        return (
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertTriangle size={12} /> {status}
          </span>
        );
    }
  };

  const filteredReservations = selectedType === 'All'
    ? reservations
    : reservations.filter(r => r.type === selectedType);

  const formatCost = (val?: string | number) => {
    const num = parseFloat(String(val || 0));
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatDateTime = (dtStr?: string | null) => {
    if (!dtStr) return 'Not set';
    const dt = new Date(dtStr);
    return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
            Trip Reservations
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage lodging, transportation, dining, and activity bookings for {trip.title}.
          </p>
        </div>
        <button
          onClick={() => { setEditingReservation(null); setIsFormOpen(true); }}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <Plus size={16} /> Add Reservation
        </button>
      </div>

      {/* Type Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['All', 'Lodging', 'Transportation', 'Restaurant', 'Activity'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedType === t ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: selectedType === t ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
              color: selectedType === t ? '#38bdf8' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }} />
          Loading reservations...
        </div>
      ) : filteredReservations.length === 0 ? (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '0.75rem', border: '1px border-dashed rgba(255, 255, 255, 0.1)' }}>
          <Hotel size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.5 }} />
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
            No {selectedType !== 'All' ? selectedType.toLowerCase() : ''} reservations found
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Add your hotel bookings, flight details, or dinner reservations to stay organized.
          </p>
          <button
            onClick={() => { setEditingReservation(null); setIsFormOpen(true); }}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
          >
            + Add First Reservation
          </button>
        </div>
      ) : (
        /* Reservations Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredReservations.map(res => (
            <div
              key={res.id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getTypeIcon(res.type)}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {res.type}
                    </span>
                  </div>
                  {getStatusBadge(res.status)}
                </div>

                {/* Title */}
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  {res.title}
                </h4>

                {/* Provider & Confirmation Code */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {res.provider && (
                    <div>Provider: <strong style={{ color: 'var(--text-main)' }}>{res.provider}</strong></div>
                  )}
                  {res.confirmation_code && (
                    <div>Confirmation: <code style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', color: 'var(--accent-cyan)' }}>{res.confirmation_code}</code></div>
                  )}
                </div>

                {/* Dates & Cost */}
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      <span>{formatDateTime(res.start_time)}</span>
                    </div>
                    {res.end_time && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        To: {formatDateTime(res.end_time)}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {formatCost(res.cost)}
                  </div>
                </div>

                {/* Notes */}
                {res.notes && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                    "{res.notes}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <button
                  onClick={() => { setEditingReservation(res); setIsFormOpen(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}
                  title="Edit Reservation"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => setDeletingId(res.id)}
                  style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}
                  title="Delete Reservation"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ReservationFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingReservation(null); }}
        onSubmit={handleSave}
        initialData={editingReservation}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        title="Delete Reservation"
        message="Are you sure you want to delete this reservation record? This action cannot be undone."
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
