import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import cron from 'node-cron';

import { setupPassport } from './config/passport.js';
import eventRoutes from './routes/events.js';
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import { runScraper } from './jobs/scrape.js';

const app = express();
const PORT = process.env.PORT || 5000;

// mongodb connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection failed:', err.message));

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// session for auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// scrape every 6 hours - keeps events fresh
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled scrape...');
  try {
    await runScraper();
  } catch (err) {
    console.error('Scheduled scrape failed:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // run scraper once on startup so there's data to show (fire and forget)
  runScraper().catch(err => console.log('Initial scrape:', err.message));
});
