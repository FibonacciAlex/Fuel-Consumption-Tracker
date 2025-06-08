const Database = require('better-sqlite3');

// SQLite connection configuration
// function maskValues(sql) {
//   return sql.replace(/VALUES\s*\(([^)]+)\)/i, (match, values) => {
//     const parts = values.split(',').map((v, i) => {
//       if (i === 1) return "'****'"; 
//       return v.trim();
//     });
//     return `VALUES (${parts.join(', ')})`;
//   });
// }

// function customLogger(sql) {
//   if (/INSERT INTO users/i.test(sql)) {
//     console.log('[SQL LOG]:', maskValues(sql));
//   } else {
//     console.log('[SQL LOG]:', sql);
//   }
// }

const db = new Database('fuel_consumption_tracker.db', {
  // verbose: customLogger
});


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