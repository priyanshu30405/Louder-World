import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

const API = '/api';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function StatusTag({ status }) {
  const classes = `status-tag status-${status}`;
  return <span className={classes}>{status}</span>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [city, setCity] = useState('Sydney');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [importing, setImporting] = useState(null);
  const [importNotes, setImportNotes] = useState('');

  const fetchEvents = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (keyword) params.set('keyword', keyword);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    fetch(`${API}/events/dashboard?${params}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [city, keyword, dateFrom, dateTo]);

  const handleImport = async (eventId) => {
    setImporting(eventId);
    try {
      const res = await fetch(`${API}/events/${eventId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ importNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents(prev => prev.map(e => e._id === eventId ? updated : e));
        if (selected?._id === eventId) setSelected(updated);
        setImportNotes('');
      }
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-inner">
          <Link to="/" className="back-link">← Events</Link>
          <h1>Dashboard</h1>
          <p>Manage and import events</p>
          <div className="user-bar">
            <span className="user-name">{user?.name || user?.email}</span>
            <button onClick={logout} className="btn-logout">Sign out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <aside className="filters">
          <h3>Filters</h3>
          <label>
            City
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="Sydney">Sydney</option>
              <option value="Sydney, Australia">Sydney, Australia</option>
              <option value="">All cities</option>
            </select>
          </label>
          <label>
            Keyword
            <input
              type="text"
              placeholder="Search title, venue, description"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </label>
          <label>
            Date from
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </label>
          <label>
            Date to
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </label>
          <button
            className="btn-refresh"
            onClick={() => {
              setLoading(true);
              fetch(`${API}/events/scrape`, { method: 'POST', credentials: 'include' })
                .then(() => fetchEvents());
            }}
          >
            Run scrape
          </button>
        </aside>

        <div className="content-area">
          <div className="table-wrap">
            {loading ? (
              <p className="loading">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="empty">No events match your filters.</p>
            ) : (
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr
                      key={ev._id}
                      className={selected?._id === ev._id ? 'selected' : ''}
                      onClick={() => setSelected(ev)}
                    >
                      <td className="col-title">{ev.title}</td>
                      <td>{formatDate(ev.dateTime)}</td>
                      <td>{ev.venueName || '—'}</td>
                      <td><StatusTag status={ev.status} /></td>
                      <td>{ev.sourceWebsite || '—'}</td>
                      <td>
                        {ev.status !== 'imported' && (
                          <button
                            className="btn-import"
                            onClick={e => { e.stopPropagation(); handleImport(ev._id); }}
                            disabled={importing === ev._id}
                          >
                            {importing === ev._id ? '…' : 'Import'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selected && (
            <aside className="preview-panel">
              <h3>Preview</h3>
              <div className="preview-content">
                <h4>{selected.title}</h4>
                <p><strong>Date:</strong> {formatDate(selected.dateTime)}</p>
                <p><strong>Venue:</strong> {selected.venueName || '—'}</p>
                <p><strong>Address:</strong> {selected.venueAddress || '—'}</p>
                <p><strong>City:</strong> {selected.city}</p>
                <p><strong>Status:</strong> <StatusTag status={selected.status} /></p>
                <p><strong>Source:</strong> {selected.sourceWebsite}</p>
                {selected.description && (
                  <p><strong>Description:</strong> {selected.description}</p>
                )}
                {selected.imageUrl && (
                  <img src={selected.imageUrl} alt={selected.title} className="preview-img" />
                )}
                <a href={selected.originalUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                  View on source →
                </a>
                {selected.status !== 'imported' && (
                  <div className="preview-import">
                    <input
                      type="text"
                      placeholder="Import notes (optional)"
                      value={importNotes}
                      onChange={e => setImportNotes(e.target.value)}
                    />
                    <button
                      className="btn-import-full"
                      onClick={() => handleImport(selected._id)}
                      disabled={importing === selected._id}
                    >
                      Import to platform
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
