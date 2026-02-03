import express from 'express';
import Event from '../models/Event.js';
import { runScraper } from '../jobs/scrape.js';

const router = express.Router();

// get events for public listing - active ones, Sydney by default
router.get('/', async (req, res) => {
  try {
    const city = req.query.city || 'Sydney, Australia';
    const limit = parseInt(req.query.limit) || 50;

    const events = await Event.find({
      city: new RegExp(city, 'i'),
      status: { $nin: ['inactive'] },
      dateTime: { $gte: new Date() }
    })
      .sort({ dateTime: 1 })
      .limit(limit)
      .lean();

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// dashboard - with filters, auth required
router.get('/dashboard', (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  next();
}, async (req, res) => {
  try {
    const { city, keyword, dateFrom, dateTo } = req.query;
    const q = {};

    if (city) q.city = new RegExp(city, 'i');
    if (dateFrom) q.dateTime = { ...q.dateTime, $gte: new Date(dateFrom) };
    if (dateTo) q.dateTime = { ...q.dateTime, $lte: new Date(dateTo) };
    if (keyword) {
      q.$or = [
        { title: new RegExp(keyword, 'i') },
        { venueName: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') }
      ];
    }

    const events = await Event.find(q).sort({ dateTime: 1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// import event - set status to imported
router.post('/:id/import', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Login required' });
    const { importNotes } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        status: 'imported',
        importedAt: new Date(),
        importedBy: req.user._id,
        importNotes: importNotes || ''
      },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// trigger scrape manually - dashboard only
router.post('/scrape', (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  next();
}, async (req, res) => {
  try {
    runScraper().catch(console.error);
    res.json({ message: 'Scrape started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
