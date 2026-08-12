import React from 'react';
import { Trip } from '../../types/trip';
import { X, MapPin, Calendar, Users, DollarSign, Navigation } from 'lucide-react';
import { ItineraryView } from './ItineraryView';


interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, isOpen, onClose, onEdit }) => {
  if (!isOpen || !trip) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatBudget = (budgetStr?: string | null) => {
    if (!budgetStr) return 'Not specified';
    const num = parseFloat(budgetStr);
    if (isNaN(num)) return budgetStr;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <div 
      className="modal-backdrop" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="trip-detail-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          background: '#0f172a'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-success" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              Phase 2 Trip Record
            </span>
            <h2 id="trip-detail-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0.5rem 0', color: 'var(--text-main)' }}>
              {trip.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
              <MapPin size={20} />
              <span>{trip.destination}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <Calendar size={16} />
              <strong style={{ color: 'var(--text-muted)' }}>Travel Dates</strong>
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </p>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <Users size={16} />
              <strong style={{ color: 'var(--text-muted)' }}>Travelers Count</strong>
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
              {trip.travelers_count} {trip.travelers_count === 1 ? 'Person' : 'People'}
            </p>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <DollarSign size={16} />
              <strong style={{ color: 'var(--text-muted)' }}>Estimated Budget (Decimal)</strong>
            </div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent-amber)', fontSize: '1.2rem' }}>
              {formatBudget(trip.budget_estimated)}
            </p>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <Navigation size={16} />
              <strong style={{ color: 'var(--text-muted)' }}>Pace & Transit</strong>
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
              {trip.travel_pace} Pace • {trip.transportation_preference}
            </p>
          </div>
        </div>

        {/* Interests Section */}
        {trip.interests && trip.interests.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Traveler Interests & Preferences
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {trip.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    border: '1px solid rgba(59, 130, 246, 0.4)'
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Section (Phase 3) */}
        <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <ItineraryView trip={trip} />
        </div>

        {/* System Meta */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span>PostgreSQL ID: <code>{trip.id}</code></span>
          <span>Created: {new Date(trip.created_at).toLocaleDateString()}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button 
            onClick={() => { onClose(); onEdit(trip); }}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Edit Trip
          </button>
          <button 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
