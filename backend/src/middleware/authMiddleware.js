// backend/src/middleware/authMiddleware.js

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Login required' });
}

module.exports = { ensureAuthenticated };
