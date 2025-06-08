const {run, query} = require('../config/dbConfig');

// Function to get a user by Google ID
async function getUserByGoogleId(googleId) {
  const queryText = 'SELECT * FROM users WHERE google_id = ?';
  const rows = await query(queryText, [googleId]);
  return rows[0];
}

// Function to create a new user
async function createUser(user) {
  console.log('Creating user:', user.name);
  const query = 'INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)';
  const result = await run(query, [user.googleId, user.name, user.email]); // Remove destructuring
  return { id: result.lastInsertRowid, ...user }; // Use result.lastInsertRowid for the inserted ID
}

async function createUsersTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        is_admin BOOLEAN DEFAULT 0
      );
    `;
    await run(query);
  }

module.exports = {
  getUserByGoogleId,
  createUser,
  createUsersTable,
};