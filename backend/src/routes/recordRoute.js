const express = require('express');
const {
  addFuelRecord,
  fetchFuelRecords,
  updateFuelRecordById,
  deleteFuelRecordById,
} = require('../controllers/recordController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a new fuel record
router.post('/fuel-records', ensureAuthenticated, addFuelRecord);

// Fetch all fuel records
router.get('/fuel-records', ensureAuthenticated, fetchFuelRecords);

// Update an existing fuel record by ID
router.put('/fuel-records/:id', ensureAuthenticated, updateFuelRecordById);

// Delete a fuel record by ID
router.delete('/fuel-records/:id', ensureAuthenticated, deleteFuelRecordById);

module.exports = router;