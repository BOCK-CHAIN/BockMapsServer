// api/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db.js');
const queries = require('../sql/queries.js');
const checkauthtoken = require('../middleware/auth.js');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '2d';

// Generate JWT
function generateAuthToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// User Registration API
router.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(queries.registerUser, [email, passwordHash]);
    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        password: password, 
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

    const token = generateAuthToken(user.id);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        password: password,
        created_at: user.created_at,
      },
    });
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
        password: user.password_hash, 
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Profile retrieval failed:', err.stack);
    res.status(500).json({ ok: false, message: 'Profile retrieval failed' });
  }
});

// Logout API
router.post('/auth/logout', (req, res) => {
  res.status(200).json({ ok: true, message: 'Logged out successfully' });
});

// Change email API
router.put('/auth/changeEmail', checkauthtoken, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.userid;

    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const result = await pool.query(queries.findByIdAndUpdate, [newEmail, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = result.rows[0];

    res.status(200).json({
      message: 'Email updated successfully',
      email: updatedUser.email,
    });
  } catch (err) {
    console.error('Email update failed:', err.stack);
    return res.status(500).json({ message: 'Update not successful' });
  }
});

router.delete('/auth/deleteAccount', checkauthtoken, async (req, res) => {
  try {
    const userId = req.userid;

    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, email`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Account deleted successfully',
      deletedUser: result.rows[0],
    });
  } catch (err) {
    console.error('Account deletion failed:', err.stack);
    return res.status(500).json({ message: 'Account deletion failed' });
  }
});


module.exports = router;
