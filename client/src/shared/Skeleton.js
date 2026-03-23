import React from 'react';
import './global.css';

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180, borderRadius: '12px 12px 0 0' }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 36, width: '40%', borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '30%' }} />
      </div>
    </div>
  );
}

export function RowSkeleton({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
      ))}
    </div>
  );
}
