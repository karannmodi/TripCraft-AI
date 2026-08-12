import React from 'react';
import { Trip } from '../../types/trip';
import { MapPin, Calendar, Users, DollarSign, Eye, Edit2, Trash2, Navigation } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onView: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onView, onEdit, onDelete }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBudget = (budgetStr?: string | null) => {
    if (!budgetStr) return 'Not set';
    const num = parseFloat(budgetStr);
    if (isNaN(num)) return budgetStr;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <div 
      className="card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',

        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
              {trip.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
              <MapPin size={16} />
              <span>{trip.destination}</span>
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            {trip.travel_pace}
          </span>
        </div>

        {/* Date & Travelers Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <span>{formatDate(trip.start_date)} – {formatDate(trip.end_date)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} style={{ color: 'var(--accent-emerald)' }} />
            <span>{trip.travelers_count} {trip.travelers_count === 1 ? 'Traveler' : 'Travelers'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={16} style={{ color: 'var(--accent-amber)' }} />
            <span>Budget: <strong style={{ color: 'var(--text-main)' }}>{formatBudget(trip.budget_estimated)}</strong></span>
          </div>
        </div>

        {/* Transport & Pace */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Navigation size={14} />
            <span>{trip.transportation_preference}</span>
          </div>
        </div>

        {/* Interests Tags */}
        {trip.interests && trip.interests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {trip.interests.map((interest, idx) => (
              <span 
                key={idx} 
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '0.5rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)' 
        }}
      >

        <button
          onClick={() => onView(trip)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
          aria-label={`View details for ${trip.title}`}
        >
          <Eye size={15} />
          View
        </button>

        <button
          onClick={() => onEdit(trip)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-color)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
          aria-label={`Edit trip ${trip.title}`}
        >
          <Edit2 size={15} />
          Edit
        </button>

        <button
          onClick={() => onDelete(trip)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
          aria-label={`Delete trip ${trip.title}`}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </div>
  );
};
