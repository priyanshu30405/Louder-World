import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  res.json({ user: { id: req.user._id, email: req.user.email, name: req.user.name } });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

export default router;
