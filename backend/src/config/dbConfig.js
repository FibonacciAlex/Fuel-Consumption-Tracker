const Database = require('better-sqlite3');

// SQLite connection configuration
const db = new Database('fuel_consumption_tracker.db', { verbose: console.log });

// Promisify database methods for easier use
const run = (query, params = []) =>
  new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(query);
      const result = stmt.run(...params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });

const query = (query, params = []) =>
  new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(query);
      const rows = stmt.all(...params);
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });

module.exports = { run, query };