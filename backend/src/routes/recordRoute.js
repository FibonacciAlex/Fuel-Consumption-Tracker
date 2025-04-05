const express = require('express');
const {
  addFuelRecord,
  fetchFuelRecords,
  updateFuelRecordById,
  deleteFuelRecordById,
} = require('../controllers/recordController');

const router = express.Router();

// Add a new fuel record
router.post('/fuel-records', addFuelRecord);

// Fetch all fuel records
router.get('/fuel-records', fetchFuelRecords);

// Update an existing fuel record by ID
router.put('/fuel-records/:id', updateFuelRecordById);

// Delete a fuel record by ID
router.delete('/fuel-records/:id', deleteFuelRecordById);

module.exports = router;