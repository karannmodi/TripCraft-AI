import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header-banner" role="banner">
      <div className="logo-group">
        <div className="logo-icon" aria-hidden="true">
          <Compass size={24} />
        </div>
        <div>
          <h1 className="logo-text">TripCraft AI</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personal AI Travel Planner</p>
        </div>
      </div>
      <nav className="nav-links" aria-label="Main Navigation">
        <span className="badge badge-success" style={{ gap: '0.4rem' }}>
          <Sparkles size={14} /> Phase 1 Foundation
        </span>
      </nav>
    </header>
  );
};
