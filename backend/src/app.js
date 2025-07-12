const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Load environment variables from .env file
// This is important for security, do not expose your credentials in the code
// Make sure to create a .env file in the root of your project 
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { createTable } = require('./models/recordModel');
const { getUserByGoogleId, createUser,  createUsersTable} = require('./models/userModel');
const jwtService = require('./services/jwtService');

const userRoute = require('./routes/userRoute');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors({
  origin: process.env.ALLOW_ORIGIN, // Allow only this origin frontend
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow OPTIONS method
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
}));

// Middleware
app.use(bodyParser.json());

// Configure Passport.js
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.callback_URL, // Use the callback URL from .env
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists in the database
    let user = await getUserByGoogleId(profile.id);

    if (!user) {
      // If user does not exist, create a new user
      user = await createUser({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Middleware for Passport.js
app.use(passport.initialize());

// Routes
const recordRoutes = require('./routes/recordRoute');
app.use('/api', recordRoutes);

// Add user routes
app.use('/auth', userRoute);

// Test route to verify requests are reaching the backend
app.get('/test', (req, res) => {
  console.log('Test route hit - Headers:', req.headers);
  res.json({ message: 'Backend is working', headers: req.headers });
});

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false, // Disable session, use JWT-based authentication flow.
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: process.env.ALLOW_ORIGIN + '/login?error=auth_failed', session: false }), // Disable session
  (req, res) => {
    // Generate JWT token after successful authentication
    const token = jwtService.generateToken(req.user);
    
    // Redirect to frontend with token as query parameter
    const redirectUrl = `${process.env.ALLOW_ORIGIN}?token=${encodeURIComponent(token)}`;
    console.log(`Google redirect is:${redirectUrl}`);
    res.redirect(redirectUrl);
  });

// Initialize Database
createTable().then(() => {
  console.log('Fuel records table initialized');
});

createUsersTable().then(() => {
  console.log('Users table initialized');
});
console.log(`Google callback URL:${process.env.callback_URL}`);
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;