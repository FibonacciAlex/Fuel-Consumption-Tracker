const jwt = require('jsonwebtoken');

// In-memory token blacklist (not persistent, for demo/dev only)
const tokenBlacklist = new Set();

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = '1h'; // Token expiration time
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      googleId: user.google_id,
      name: user.name,
      //email: user.email,
      isAdmin: user.is_admin || false
    };

    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }
    return authHeader.substring(7);
  }

  // Blacklist functions
  addToBlacklist(token) {
    tokenBlacklist.add(token);
  }

  isBlacklisted(token) {
    return tokenBlacklist.has(token);
  }
}

module.exports = new JwtService(); 