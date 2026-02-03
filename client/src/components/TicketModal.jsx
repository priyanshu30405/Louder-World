import { useState } from 'react';
import './TicketModal.css';

export default function TicketModal({ event, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim(), optIn);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 className="modal-title">{event.title}</h2>
        <p className="modal-subtitle">Enter your email to get tickets</p>
        <form onSubmit={handleSubmit}>
          <label className="modal-label">
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="modal-input"
            />
          </label>
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={optIn}
              onChange={e => setOptIn(e.target.checked)}
            />
            <span>I'd like to receive updates and event recommendations</span>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Continue to tickets</button>
          </div>
        </form>
      </div>
    </div>
  );
}
