const { insertFuelRecord, getFuelRecords, updateFuelRecord, deleteFuelRecord } = require('../models/recordModel');

// Add a new fuel record
const addFuelRecord = async (req, res) => {
  const { date, amount, price, licensePlate,isFull, odometer } = req.body;
  try {
    await insertFuelRecord(date, amount, price,licensePlate,isFull, odometer);
    res.status(201).json({ message: 'Fuel record added successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to add fuel record' });
  }
};

// Fetch all fuel records
const fetchFuelRecords = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Login required' });
  }

  try {
    const { startDate, endDate, licensePlate } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;

    const records = await getFuelRecords(userId, isAdmin, { startDate, endDate, licensePlate });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing fuel record
const updateFuelRecordById = async (req, res) => {
  const { id } = req.params;
  const { date, fuelAmount, price } = req.body;
  try {
    await updateFuelRecord(id, date, fuelAmount, price);
    res.status(200).json({ message: 'Fuel record updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to update fuel record' });
  }
};

// Delete a fuel record
const deleteFuelRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteFuelRecord(id);
    res.status(200).json({ message: 'Fuel record deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to delete fuel record' });
  }
};

module.exports = {
  addFuelRecord,
  fetchFuelRecords,
  updateFuelRecordById,
  deleteFuelRecordById,
};