import React, { useEffect, useState } from 'react';
import { Header } from './components/common/Header';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorAlert } from './components/common/ErrorAlert';
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
        <section className="card" style={{ marginBottom: '2rem' }} aria-labelledby="foundation-heading">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 id="foundation-heading" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                Phase 1 — Foundation & Connectivity Verification
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '700px' }}>
                TripCraft AI application skeleton initialized with React 18, Vite, TypeScript, and FastAPI backend with PostgreSQL NUMERIC(10,2) Decimal precision database models.
              </p>
            </div>
            <button 
              onClick={checkConnectivity} 
              className="btn-primary"
              aria-label="Refresh Backend System Health Status"
            >
              Check Backend Health
            </button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            {loading && <LoadingSpinner label="Pinging FastAPI backend health endpoint..." />}

            {error && (
              <ErrorAlert 
                title="Backend Connection Status" 
                message={`Could not establish connection with FastAPI backend at ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}. Make sure the backend server is running.`} 
              />
            )}

            {health && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                    <Server size={20} />
                    <strong style={{ color: 'var(--text-main)' }}>FastAPI Status</strong>
                  </div>
                  <span className="badge badge-success">{health.status.toUpperCase()}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    App: {health.app_name} ({health.environment})
                  </p>
                </div>

                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <Database size={20} />
                    <strong style={{ color: 'var(--text-main)' }}>PostgreSQL Engine</strong>
                  </div>
                  <span className={`badge ${health.database_status === 'connected' ? 'badge-success' : 'badge-error'}`}>
                    {health.database_status ? health.database_status.toUpperCase() : 'UNKNOWN'}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Driver: {health.database_engine || 'postgresql+asyncpg'}
                  </p>
                </div>

                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--accent-emerald)' }}>
                    <Cpu size={20} />
                    <strong style={{ color: 'var(--text-main)' }}>AI Architecture</strong>
                  </div>
                  <span className="badge badge-success">DECOUPLED INTERFACE</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    BaseAIService abstract interface ready
                  </p>
                </div>

                <div className="card" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--accent-amber)' }}>
                    <ShieldCheck size={20} />
                    <strong style={{ color: 'var(--text-main)' }}>AWS Deployment</strong>
                  </div>
                  <span className="badge badge-success">SINGLE SERVICE READY</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    App Runner SPA static mount ready
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="card" aria-labelledby="specs-heading">
          <h3 id="specs-heading" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Phase 1 Architectural Checklist Completed
          </h3>
          <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
              PostgreSQL primary DB connection using Async SQLAlchemy 2.0 with <code style={{ color: 'var(--accent-cyan)' }}>NUMERIC(10,2)</code> currency columns.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
              Clean 6-layer separation: React UI &rarr; API Client &rarr; FastAPI Routes &rarr; Service Layer &rarr; DB Models &rarr; AI Service.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
              Isolated <code style={{ color: 'var(--accent-cyan)' }}>BaseAIService</code> abstract interface with zero paid API dependencies.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
              Single-service App Runner deployment static asset mounting structure configured in <code style={{ color: 'var(--accent-cyan)' }}>backend/app/main.py</code>.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>✓</span>
              Academic progress tracking log initialized at <code style={{ color: 'var(--accent-cyan)' }}>docs/development-log.md</code>.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};
