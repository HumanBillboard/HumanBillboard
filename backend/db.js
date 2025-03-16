const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Create pool of connections using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err))

module.exports = pool;