const pool = require('../db');

const addToWaitlist = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    await pool.query(
      'INSERT INTO waitlist_signups(email) VALUES($1)',
      [email]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already signed up' });
    }
    res.status(500).json({ error: err.message });
  }
};

const getWaitlist = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM waitlist_signups ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addToWaitlist,
  getWaitlist,
};
