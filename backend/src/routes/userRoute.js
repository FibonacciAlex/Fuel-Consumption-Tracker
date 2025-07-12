const express = require('express');
const jwtService = require('../services/jwtService');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

// Get current user info (requires JWT token)
router.get('/user', ensureAuthenticated, (req, res) => {
  console.log('User route - Request received for /user');
  console.log('User route - User data:', req.user);
  
  res.json({ 
    user: { 
      id: req.user.id,
      name: req.user.name, 
      email: req.user.email,
      isAdmin: req.user.isAdmin
    } 
  });
});

// Logout endpoint (server-side token blacklist)
router.post('/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // Server-side, we implement a token blacklist
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = jwtService.extractTokenFromHeader(authHeader);
      jwtService.addToBlacklist(token);
    }
  } catch (err) {
    // Ignore errors in logout
  }
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;