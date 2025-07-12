const jwtService = require('../services/jwtService');

function ensureAuthenticated(req, res, next) {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    console.log('Auth middleware - Method:', req.method);
    console.log('Auth middleware - URL:', req.url);
    
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = jwtService.extractTokenFromHeader(authHeader);
    // Check if token is blacklisted
    if (jwtService.isBlacklisted(token)) {
      return res.status(401).json({ error: 'Unauthorized: Token is blacklisted' });
    }
    const decoded = jwtService.verifyToken(token);
    
    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
}

module.exports = { ensureAuthenticated };
