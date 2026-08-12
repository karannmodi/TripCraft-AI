import React, { useState } from 'react';
import { Trip } from '../../types/trip';
import { X, MapPin, Calendar, Users, DollarSign, Navigation, ListChecks, Hotel, Wallet, Info } from 'lucide-react';
import { ItineraryView } from './ItineraryView';
import { ReservationsView } from './ReservationsView';
import { BudgetView } from './BudgetView';

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
}

type TabType = 'details' | 'itinerary' | 'reservations' | 'budget';

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');

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
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          background: '#0f172a'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-success" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
              TripCraft Management Workspace
            </span>
            <h2 id="trip-detail-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0 0.4rem 0', color: 'var(--text-main)' }}>
              {trip.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '1.05rem' }}>
              <MapPin size={18} />
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

        {/* Navigation Tabs */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
            marginBottom: '1.25rem',
            overflowX: 'auto'
          }}
        >
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'details' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'details' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Info size={16} /> Trip Details
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'itinerary' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'itinerary' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ListChecks size={16} /> Itinerary
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'reservations' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'reservations' ? '#38bdf8' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Hotel size={16} /> Reservations
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'budget' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              color: activeTab === 'budget' ? 'var(--accent-amber)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Wallet size={16} /> Budget Tracker
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div>
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
                  <strong style={{ color: 'var(--text-muted)' }}>Estimated Budget</strong>
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

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span>PostgreSQL ID: <code>{trip.id}</code></span>
              <span>Created: {new Date(trip.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Tab 2: Itinerary */}
        {activeTab === 'itinerary' && (
          <ItineraryView trip={trip} />
        )}

        {/* Tab 3: Reservations */}
        {activeTab === 'reservations' && (
          <ReservationsView trip={trip} />
        )}

        {/* Tab 4: Budget Tracker */}
        {activeTab === 'budget' && (
          <BudgetView trip={trip} />
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={() => { onClose(); onEdit(trip); }}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Edit Trip Details
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
