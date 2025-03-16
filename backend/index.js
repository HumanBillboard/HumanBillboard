const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 8080;

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW();');
    res.json({success: true, time: result.rows[0]});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));