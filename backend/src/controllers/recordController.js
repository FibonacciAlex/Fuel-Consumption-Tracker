const { insertFuelRecord, getFuelRecords, updateFuelRecord, deleteFuelRecord } = require('../models/recordModel');

// Add a new fuel record
const addFuelRecord = async (req, res) => {
  const { date, amount, price, licensePlate, isFull, odometer } = req.body;

  console.log('Adding fuel record, date:', date,', amount:', amount,', price:',price,', licensePlate:',licensePlate,', isFull:',isFull,', odometer:', odometer);
  try {
    await insertFuelRecord(
      req.user.id,
      date,
      amount,
      price,
      licensePlate,
      isFull,
      odometer
    );
    res.status(201).json({ message: 'Fuel record added successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to add fuel record' });
  }
};

// Fetch all fuel records
const fetchFuelRecords = async (req, res) => {
  try {
    const { startDate, endDate, licensePlate } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;
    console.log('Fetching fuel records for user:', userId, 'Admin:', isAdmin, 'Date Range:', startDate, endDate, 'License Plate:', licensePlate);
    const records = await getFuelRecords(userId, isAdmin, { startDate, endDate, licensePlate });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing fuel record
const updateFuelRecordById = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Login required' });
  }
  const { id } = req.params;
  const { date, amount, price, licensePlate, isFull, odometer } = req.body;
  // Map isFull to filled for DB (ensure number)
  //const filled = (isFull === true || isFull === 'true') ? 1 : 0;
  try {
    console.log('Updating fuel record:', { id, date, amount, price, licensePlate, isFull, odometer });
    if (!id || !date || amount === undefined || price === undefined || !licensePlate || odometer === undefined) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    await updateFuelRecord(
      id,
      date,
      amount,
      price,
      licensePlate,
      isFull,
      odometer
    );
    res.status(200).json({ message: 'Fuel record updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to update fuel record' });
  }
};

// Delete a fuel record
const deleteFuelRecordById = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Login required' });
  }
  const { id } = req.params;
  try {
    console.log('Deleting fuel record with ID:', id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid record ID' });
    }
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