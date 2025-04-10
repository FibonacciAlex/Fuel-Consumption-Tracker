const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
  if (req.user) {
    res.json({ user: { name: req.user.name, email: req.user.email } });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ error: 'Failed to destroy session' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;