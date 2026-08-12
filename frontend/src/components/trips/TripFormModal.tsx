import React, { useState, useEffect } from 'react';
import { Trip, TripCreateInput } from '../../types/trip';
import { X, AlertCircle } from 'lucide-react';


interface TripFormModalProps {
  isOpen: boolean;
  initialTrip?: Trip | null;
  isSubmitting: boolean;
  onSubmit: (data: TripCreateInput) => Promise<void>;
  onClose: () => void;
}

const PRESET_INTERESTS = [
  'Architecture',
  'Food',
  'Museums',
  'Photography',
  'History',
  'Nature',
  'Shopping',
  'Relaxation',
  'Nightlife',
  'Art'
];

const PACES = ['Slow', 'Moderate', 'Fast'];
const TRANSPORTS = [
  'Walking and Public Transit',
  'Public Transit',
  'Walking',
  'Rental Car',
  'Rideshare',
  'Bicycle',
  'Flight'
];

export const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  initialTrip,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  const isEditMode = !!initialTrip;

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [budgetEstimated, setBudgetEstimated] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelPace, setTravelPace] = useState('Moderate');
  const [transportPref, setTransportPref] = useState('Walking and Public Transit');

  // Validation error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTrip) {
      setTitle(initialTrip.title || '');
      setDestination(initialTrip.destination || '');
      setStartDate(initialTrip.start_date || '');
      setEndDate(initialTrip.end_date || '');
      setTravelersCount(initialTrip.travelers_count || 1);
      setBudgetEstimated(initialTrip.budget_estimated ? String(initialTrip.budget_estimated) : '');
      setSelectedInterests(initialTrip.interests || []);
      setTravelPace(initialTrip.travel_pace || 'Moderate');
      setTransportPref(initialTrip.transportation_preference || 'Walking and Public Transit');
    } else {
      // Default clean values for creation
      setTitle('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setTravelersCount(2);
      setBudgetEstimated('');
      setSelectedInterests([]);
      setTravelPace('Moderate');
      setTransportPref('Walking and Public Transit');
    }
    setFieldErrors({});
    setSubmitError(null);
  }, [initialTrip, isOpen]);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Trip title is required';
    }

    if (!destination.trim()) {
      errors.destination = 'Destination is required';
    }

    if (!startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!endDate) {
      errors.endDate = 'End date is required';
    } else if (startDate && endDate < startDate) {
      errors.endDate = 'End date cannot occur before start date';
    }

    if (!travelersCount || travelersCount < 1) {
      errors.travelersCount = 'Traveler count must be at least 1';
    }

    if (budgetEstimated !== '') {
      const budgetNum = parseFloat(budgetEstimated);
      if (isNaN(budgetNum) || budgetNum < 0) {
        errors.budgetEstimated = 'Budget cannot be negative';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    const payload: TripCreateInput = {
      title: title.trim(),
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      travelers_count: Number(travelersCount),
      budget_estimated: budgetEstimated.trim() !== '' ? budgetEstimated.trim() : null,
      interests: selectedInterests,
      travel_pace: travelPace,
      transportation_preference: transportPref,
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while saving the trip.');
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-form-title"
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
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          background: '#0f172a'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
          <h2 id="modal-form-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            {isEditMode ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            aria-label="Close dialog"
          >
            <X size={22} />
          </button>
        </div>

        {submitError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '0.5rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Trip Title & Destination */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="trip-title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Trip Title / Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="trip-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chicago Weekend"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: fieldErrors.title ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.title}
                aria-describedby={fieldErrors.title ? "title-error" : undefined}
              />
              {fieldErrors.title && (
                <span id="title-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.title}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="trip-destination" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Destination <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="trip-destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Chicago, Illinois"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: fieldErrors.destination ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.destination}
                aria-describedby={fieldErrors.destination ? "destination-error" : undefined}
              />
              {fieldErrors.destination && (
                <span id="destination-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.destination}
                </span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="start-date" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Start Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: fieldErrors.startDate ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.startDate}
                aria-describedby={fieldErrors.startDate ? "start-date-error" : undefined}
              />
              {fieldErrors.startDate && (
                <span id="start-date-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.startDate}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="end-date" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                End Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: fieldErrors.endDate ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.endDate}
                aria-describedby={fieldErrors.endDate ? "end-date-error" : undefined}
              />
              {fieldErrors.endDate && (
                <span id="end-date-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.endDate}
                </span>
              )}
            </div>
          </div>

          {/* Travelers & Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label htmlFor="travelers-count" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Number of Travelers (min 1) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                id="travelers-count"
                type="number"
                min="1"
                step="1"
                value={travelersCount}
                onChange={(e) => setTravelersCount(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: fieldErrors.travelersCount ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.travelersCount}
                aria-describedby={fieldErrors.travelersCount ? "travelers-error" : undefined}
              />
              {fieldErrors.travelersCount && (
                <span id="travelers-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.travelersCount}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="budget-estimated" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Estimated Budget ($ Decimal)
              </label>
              <input 
                id="budget-estimated"
                type="number"
                min="0"
                step="0.01"
                value={budgetEstimated}
                onChange={(e) => setBudgetEstimated(e.target.value)}
                placeholder="e.g. 1800.00"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: fieldErrors.budgetEstimated ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.budgetEstimated}
                aria-describedby={fieldErrors.budgetEstimated ? "budget-error" : undefined}
              />
              {fieldErrors.budgetEstimated && (
                <span id="budget-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.budgetEstimated}
                </span>
              )}
            </div>
          </div>

          {/* Pace & Transportation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label htmlFor="travel-pace" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Preferred Travel Pace
              </label>
              <select 
                id="travel-pace"
                value={travelPace}
                onChange={(e) => setTravelPace(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
              >
                {PACES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transport-pref" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Transportation Preference
              </label>
              <select 
                id="transport-pref"
                value={transportPref}
                onChange={(e) => setTransportPref(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.375rem',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
                disabled={isSubmitting}
              >
                {TRANSPORTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interests Chips */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Interests & Preferences (Select all that apply)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESET_INTERESTS.map(interest => {
                const selected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: selected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                      color: selected ? '#93c5fd' : 'var(--text-muted)',
                      transition: 'all 0.15s ease'
                    }}
                    aria-pressed={selected}
                  >
                    {selected ? `✓ ${interest}` : `+ ${interest}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button 
              type="button"
              onClick={onClose} 
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                padding: '0.65rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Saving to PostgreSQL...' : isEditMode ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
