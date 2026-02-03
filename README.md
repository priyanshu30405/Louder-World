# Sydney Events

Internship assignment – Sydney events aggregator. Scrapes events from public sites, stores in DB, and shows them with a clean UI. Has a dashboard for managing/importing events and Google sign-in.

## Features

- Scrapes events from Sydney event websites (Timeout, Eventbrite, etc.)
- Stores in MongoDB – title, date/time, venue, city, description, category, image, source URL, last scraped
- Cron job runs every 6 hrs to pick up new/updated events and mark inactive ones
- Public event listing with cards + "Get tickets" button
- Get tickets: asks for email, opt-in checkbox, saves to DB, then redirects to source
- Google OAuth – need to sign in to use the dashboard
- Dashboard: city filter (Sydney default), keyword search, date range, table view, preview panel on row click
- Import to platform button – sets imported status, saves importedAt, importedBy, importNotes
- Status tags: new, updated, inactive, imported

## Setup

1. Install everything:

   ```bash
   npm run install:all
   ```

2. MongoDB – use Atlas (free tier) or local. Create `server/.env` from `server/.env.example` and set `MONGODB_URI`.

3. Google OAuth – create a project in [Google Cloud Console](https://console.cloud.google.com/), get OAuth credentials (Web app), add redirect URI `http://localhost:5000/api/auth/google/callback`, put client ID and secret in `.env`.

4. Run:

   ```bash
   npm run dev
   ```

   Backend: http://localhost:5000  
   Frontend: http://localhost:5173  

5. If there's no events showing, run `npm run scrape` – it seeds some sample Sydney events as fallback (some sites are tricky to scrape because of JS rendering).

## Structure

- `server/` – Express, mongoose, scraper
- `client/` – React + Vite
- `server/jobs/scrape.js` – main scraping logic + sample events

## Pipeline

scrape → store → display → review (dashboard) → import → tag updates
