// api/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { generateAuthToken, generateRefreshToken } = require('../utils/tokens.js');
const { pool } = require('../config/db.js');
const queries = require('../sql/queries.js');
const checkauthtoken = require('../middleware/auth.js');

const router = express.Router();

// User Registration API
router.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // ✅ Email format validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(queries.registerUser, [email, passwordHash]);
    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Registration failed:', err.stack);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login API
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(queries.findUserByEmail, [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate and set tokens in HTTP-only cookies
    const authtoken = generateAuthToken(user.id);
    const refreshtoken = generateRefreshToken(user.id);

    res.cookie('authtoken', authtoken, { httpOnly: true });
    res.cookie('refreshtoken', refreshtoken, { httpOnly: true });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login failed:', err.stack);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Profile API
router.get('/auth/profile', checkauthtoken, async (req, res) => {
  try {
    const result = await pool.query(queries.findUserById, [req.userid]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    res.status(200).json({
      ok: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Profile retrieval failed:', err.stack);
    res.status(500).json({ ok: false, message: 'Profile retrieval failed' });
  }
});

// Logout API
router.post('/auth/logout', checkauthtoken, (req, res) => {
  res.clearCookie('authtoken');
  res.clearCookie('refreshtoken');

  res.status(200).json({ ok: true, message: 'Logged out successfully' });
});

module.exports = router;
