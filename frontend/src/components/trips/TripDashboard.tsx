import React, { useState, useEffect } from 'react';
import { Trip, TripCreateInput, TripUpdateInput } from '../../types/trip';
import { fetchTrips, createTrip, updateTrip, deleteTrip } from '../../api/client';
import { TripCard } from './TripCard';
import { TripFormModal } from './TripFormModal';
import { TripDetailModal } from './TripDetailModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { Plus, Search, RefreshCw, Compass, CheckCircle } from 'lucide-react';

export const TripDashboard: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrips();
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trips from PostgreSQL backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingTrip(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  // Open View Detail
  const handleOpenView = (trip: Trip) => {
    setViewingTrip(trip);
    setIsDetailOpen(true);
  };

  // Open Delete Confirm
  const handleOpenDelete = (trip: Trip) => {
    setDeletingTrip(trip);
    setIsDeleteOpen(true);
  };

  // Form Submit Handler (Create or Update)
  const handleFormSubmit = async (payload: TripCreateInput) => {
    setIsSubmitting(true);
    try {
      if (editingTrip) {
        const updated = await updateTrip(editingTrip.id, payload as TripUpdateInput);
        setTrips(trips.map(t => (t.id === updated.id ? updated : t)));
        showToast(`Trip "${updated.title}" updated successfully!`);
      } else {
        const created = await createTrip(payload);
        setTrips([created, ...trips]);
        showToast(`Trip "${created.title}" created successfully!`);
      }
      setIsFormOpen(false);
      setEditingTrip(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Confirm Handler
  const handleDeleteConfirm = async () => {
    if (!deletingTrip) return;
    setIsDeleting(true);
    try {
      await deleteTrip(deletingTrip.id);
      setTrips(trips.filter(t => t.id !== deletingTrip.id));
      showToast(`Trip "${deletingTrip.title}" was deleted.`);
      setIsDeleteOpen(false);
      setDeletingTrip(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered trips
  const filteredTrips = trips.filter(t => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      t.title.toLowerCase().includes(query) ||
      t.destination.toLowerCase().includes(query) ||
      (t.interests && t.interests.some(i => i.toLowerCase().includes(query)))
    );
  });

  return (
    <section aria-labelledby="trips-dashboard-heading" style={{ marginTop: '1.5rem' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600
          }}
        >
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Controls */}
      <div 
        className="card" 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          background: 'rgba(15, 23, 42, 0.7)'
        }}
      >

        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
            <Compass size={24} />
            <h2 id="trips-dashboard-heading" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Trip Dashboard
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Manage your saved trips stored directly in PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={loadTrips}
            disabled={loading}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem'
            }}
            aria-label="Refresh trips list from database"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          <button 
            onClick={handleOpenCreate}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700
            }}
            aria-label="Create New Trip"
          >
            <Plus size={18} />
            Create Trip
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {trips.length > 0 && (
        <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Filter trips by title, destination, or interest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
              borderRadius: '0.375rem',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.9rem'
            }}
            aria-label="Search and filter trips"
          />
        </div>
      )}

      {/* Content Area */}
      {loading && <LoadingSpinner label="Loading saved trips from PostgreSQL..." />}

      {error && (
        <ErrorAlert 
          title="Trip Dashboard Error"
          message={error}
        />
      )}

      {!loading && !error && trips.length === 0 && (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '3.5rem 1.5rem', 
            background: 'rgba(15, 23, 42, 0.5)', 
            border: '2px dashed rgba(255, 255, 255, 0.1)' 
          }}
        >
          <Compass size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            No Trips Saved Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
            Your trip dashboard is empty. Create your first travel plan to get started with TripCraft AI!
          </p>
          <button 
            onClick={handleOpenCreate} 
            className="btn-primary" 
            style={{ padding: '0.75rem 1.5rem' }}
          >
            + Create Your First Trip
          </button>
        </div>
      )}

      {!loading && !error && trips.length > 0 && filteredTrips.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No trips matched your search filter "<strong>{searchTerm}</strong>".
          </p>
          <button 
            onClick={() => setSearchTerm('')} 
            className="btn-secondary" 
            style={{ marginTop: '0.5rem' }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {!loading && !error && filteredTrips.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredTrips.map(trip => (
            <TripCard 
              key={trip.id}
              trip={trip}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TripFormModal 
        isOpen={isFormOpen}
        initialTrip={editingTrip}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      <TripDetailModal 
        isOpen={isDetailOpen}
        trip={viewingTrip}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(trip) => {
          setIsDetailOpen(false);
          handleOpenEdit(trip);
        }}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen}
        tripTitle={deletingTrip?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setIsDeleteOpen(false)}
      />
    </section>
  );
};
