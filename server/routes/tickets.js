import express from 'express';
import TicketInterest from '../models/TicketInterest.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, eventId, optIn } = req.body;
    if (!email || !eventId) {
      return res.status(400).json({ error: 'Email and eventId required' });
    }
    await TicketInterest.create({ email, eventId, optIn: !!optIn });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
