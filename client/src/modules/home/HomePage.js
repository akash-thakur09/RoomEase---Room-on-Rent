import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const ROOM_TYPES = [
  { type: 'Single Room', desc: 'Private space, perfect for solo living with full privacy.', emoji: '🛏️' },
  { type: 'Shared Room', desc: 'Affordable option with shared amenities and great community.', emoji: '🏠' },
  { type: 'Apartment', desc: 'Full apartment with kitchen, living room, and more.', emoji: '🏢' },
];

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Find Your Perfect Room</h1>
          <p className="hero__subtitle">Browse hundreds of verified listings across the city. Simple, fast, and hassle-free.</p>
          <Link to="/search" className="btn btn-primary hero__cta">Explore Rooms →</Link>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__blob" />
        </div>
      </section>

      <section className="room-types page-container">
        <h2 className="section-title">What are you looking for?</h2>
        <div className="grid-3">
          {ROOM_TYPES.map(({ type, desc, emoji }) => (
            <Link to="/search" key={type} className="room-type-card card">
              <div className="room-type-card__icon">{emoji}</div>
              <h3>{type}</h3>
              <p>{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="how-it-works page-container">
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          {[
            { step: '01', title: 'Search', desc: 'Filter by city, type, and budget.' },
            { step: '02', title: 'Book', desc: 'Send a booking request instantly.' },
            { step: '03', title: 'Move In', desc: 'Get approved and move in.' },
          ].map(({ step, title, desc }) => (
            <div className="step-card card" key={step}>
              <span className="step-card__num">{step}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
