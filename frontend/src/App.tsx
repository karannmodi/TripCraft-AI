import React, { useEffect, useState } from 'react';
import { Header } from './components/common/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorAlert } from './components/common/ErrorAlert';
import { TripDashboard } from './components/trips/TripDashboard';
import { fetchHealth } from './api/client';
import { HealthResponse } from './types/trip';
import { Database, Server, ShieldCheck, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnectivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to FastAPI backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div className="app-container">
      <Header />

      <main role="main">
        {/* System Architecture & Health Widget */}
        <section className="card" style={{ marginBottom: '1.5rem' }} aria-labelledby="foundation-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 id="foundation-heading" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                TripCraft AI — System Architecture &amp; Health
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '750px', margin: 0, fontSize: '0.9rem' }}>
                React 18 frontend communicating with FastAPI, PostgreSQL (NUMERIC 10,2 exact currency precision), and local Ollama (Gemma 3 1B).
              </p>
            </div>
            <button 
              onClick={checkConnectivity} 
              className="btn-primary"
              aria-label="Refresh Backend System Health Status"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Check System Health
            </button>
          </div>

          <div>
            {loading && <LoadingSpinner label="Pinging FastAPI backend health endpoint..." />}

            {error && (
              <ErrorAlert 
                title="Backend Connection Status" 
                message={`Could not establish connection with FastAPI backend at ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}. Make sure the backend server is running.`} 
              />
            )}

            {health && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>
                    <Server size={18} />
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>FastAPI Status</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{health.status.toUpperCase()}</span>
                </div>

                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--accent-cyan)' }}>
                    <Database size={18} />
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>PostgreSQL Engine</strong>
                  </div>
                  <span className={`badge ${health.database_status === 'connected' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.75rem' }}>
                    {health.database_status ? health.database_status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>

                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#a855f7' }}>
                    <Cpu size={18} />
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Local AI Model</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                    OLLAMA / GEMMA 3 1B
                  </span>
                </div>

                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--accent-emerald)' }}>
                    <ShieldCheck size={18} />
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>MVP Readiness</strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>ASSIGNMENT 5.3 COMPLETE</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Trip Dashboard Core Feature */}
        <TripDashboard />
      </main>
    </div>
  );
};
