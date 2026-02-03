import './EventCard.css';

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function EventCard({ event, onGetTickets }) {
  const { title, dateTime, venueName, venueAddress, description, sourceWebsite, imageUrl, originalUrl } = event;

  return (
    <article className="event-card">
      <div className="event-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="event-card-placeholder">No image</div>
        )}
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{title}</h3>
        <p className="event-card-date">{formatDate(dateTime)}</p>
        {(venueName || venueAddress) && (
          <p className="event-card-venue">
            {[venueName, venueAddress].filter(Boolean).join(' · ')}
          </p>
        )}
        {description && (
          <p className="event-card-desc">{description.slice(0, 120)}{description.length > 120 ? '…' : ''}</p>
        )}
        {sourceWebsite && (
          <span className="event-card-source">via {sourceWebsite}</span>
        )}
        <div className="event-card-actions">
          <button className="btn-get-tickets" onClick={() => onGetTickets(event)}>
            Get tickets
          </button>
          <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="link-external">
            View on source
          </a>
        </div>
      </div>
    </article>
  );
}
