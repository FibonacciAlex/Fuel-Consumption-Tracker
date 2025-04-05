const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware

const { createTable } = require('./models/recordModel');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // Allow only this origin frontend
}));

// Middleware
app.use(bodyParser.json());

// Routes
const recordRoutes = require('./routes/recordRoute');
app.use('/api', recordRoutes);

// Initialize Database
createTable().then(() => {
  console.log('Database initialized');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});