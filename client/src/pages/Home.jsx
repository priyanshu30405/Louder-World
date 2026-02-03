import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import EventCard from '../components/EventCard';
import TicketModal from '../components/TicketModal';
import './Home.css';

const API = '/api';

export default function Home() {
  const { user, login, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketEvent, setTicketEvent] = useState(null);

  useEffect(() => {
    fetch(`${API}/events?city=Sydney`)
      .then(r => r.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleGetTickets = (event) => {
    setTicketEvent(event);
  };

  const handleTicketSubmit = async (email, optIn) => {
    if (!ticketEvent) return;
    await fetch(`${API}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, eventId: ticketEvent._id, optIn })
    });
    setTicketEvent(null);
    window.open(ticketEvent.originalUrl, '_blank');
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="header-inner">
          <h1 className="logo">Sydney Events</h1>
          <p className="tagline">What's happening in Sydney</p>
          <nav className="nav">
            {user ? (
              <>
                <a href="/dashboard" className="nav-link">Dashboard</a>
                <button onClick={logout} className="btn btn-ghost">Sign out</button>
              </>
            ) : (
              <button onClick={login} className="btn btn-primary">Sign in with Google</button>
            )}
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="events-intro">
          <h2>Upcoming events</h2>
          <p>Browse and grab tickets for events around Sydney.</p>
        </section>

        {loading ? (
          <p className="loading">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="empty">No events at the moment. Check back soon.</p>
        ) : (
          <div className="event-grid">
            {events.map(ev => (
              <EventCard key={ev._id} event={ev} onGetTickets={handleGetTickets} />
            ))}
          </div>
        )}
      </main>

      {ticketEvent && (
        <TicketModal
          event={ticketEvent}
          onClose={() => setTicketEvent(null)}
          onSubmit={handleTicketSubmit}
        />
      )}
    </div>
  );
}
