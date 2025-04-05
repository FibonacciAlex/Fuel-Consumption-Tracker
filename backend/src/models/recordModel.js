const { run, query } = require('../config/dbConfig');

// Create the fuel records table
const createTable = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS fuel_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      price REAL NOT NULL,
      licensePlate TEXT NOT NULL,
      filled BOOLEAN DEFAULT 0,
      odometer REAL NOT NULL
    )
  `);
};

// Insert a new fuel record
const insertFuelRecord = async (date, fuelAmount, price, plate_number, full, odometer) => {
  console.log(date, fuelAmount, price, plate_number, full, odometer);
  
  full = full === true ? 1 : 0; // Convert boolean to 0/1, SQLite uses 0/1 for boolean values
  
  await run(
    'INSERT INTO fuel_records (date, amount, price, licensePlate, filled, odometer) VALUES (?, ?, ?, ?, ?, ?)',
    [date, fuelAmount, price, plate_number, full, odometer]
  );
};

// Fetch all fuel records with optional filters
const getFuelRecords = async (filters = {}) => {
  const { startDate, endDate, licensePlate } = filters;
  let queryText = 'SELECT * FROM fuel_records WHERE 1=1';
  const queryParams = [];

  if (startDate) {
    queryText += ' AND date >= ?';
    queryParams.push(startDate);
  }

  if (endDate) {
    queryText += ' AND date <= ?';
    queryParams.push(endDate);
  }

  if (licensePlate) {
    queryText += ' AND licensePlate = ?';
    queryParams.push(licensePlate);
  }

  return await query(queryText, queryParams);
};

// Update an existing fuel record
const updateFuelRecord = async (id, date, fuelAmount, price, plate_number, full, odometer) => {
  if (typeof date === 'string') {
    date = new Date(date).toISOString().split('T')[0];
  }
  await run(
    'UPDATE fuel_records SET date = ?, amount = ?, price = ?, licensePlate = ?, filled = ?, odometer = ? WHERE id = ?',
    [date, fuelAmount, price, plate_number, full, odometer, id]
  );
};

// Delete a fuel record
const deleteFuelRecord = async (id) => {
  await run('DELETE FROM fuel_records WHERE id = ?', [id]);
};

module.exports = {
  createTable,
  insertFuelRecord,
  getFuelRecords,
  updateFuelRecord,
  deleteFuelRecord,
};