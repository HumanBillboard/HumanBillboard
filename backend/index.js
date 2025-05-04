const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Test DB connection
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW();');
    res.json({ success: true, time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



/*
  Mount routes

  index.js request
    -> routes/<name>.js
    -> controllers/<name>Controller.js
*/

/*
  http://localhost:8080/api/waitlist
*/
const waitlistRouter = require('./routes/waitlist');
app.use('/api/waitlist', waitlistRouter);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));