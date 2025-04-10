const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session'); // Import the session middleware

// Load environment variables from .env file
// This is important for security, do not expose your credentials in the code
// Make sure to create a .env file in the root of your project 
require("dotenv").config();

const { createTable } = require('./models/recordModel');
const { getUserByGoogleId, createUser,  createUsersTable} = require('./models/userModel');

const userRoute = require('./routes/userRoute');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors({
  origin: 'http://localhost:5173', // Allow only this origin frontend
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

// Middleware
app.use(bodyParser.json());

// Add session middleware
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));

// Configure Passport.js
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
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

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware for Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Routes
const recordRoutes = require('./routes/recordRoute');
app.use('/api', recordRoutes);

// Add user routes
app.use('/auth', userRoute);

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend or dashboard
    res.redirect('http://localhost:5173');
  });

// Initialize Database
createTable().then(() => {
  console.log('Fuel records table initialized');
});

createUsersTable().then(() => {
  console.log('Users table initialized');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;