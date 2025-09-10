const express = require('express');
const { pool } = require('../config/db.js');
const addressQueries = require('../sql/storedAddress.js');
const checkauthtoken = require('../middleware/auth.js');

const router = express.Router();

// Add a new address to a list
router.post('/addresses', checkauthtoken, async (req, res) => {
  const { list_id, name, latitude, longitude } = req.body;
  const userId = req.userid;

  if (!list_id || !name || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if an address with the same lat & lon already exists for this user
    const existing = await pool.query(
      'SELECT * FROM stored_addresses WHERE user_id = $1 AND latitude = $2 AND longitude = $3',
      [userId, latitude, longitude]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'This address already exists' });
    }

    const result = await pool.query(addressQueries.createAddress, [
      userId,
      list_id,
      name.trim(),
      latitude,
      longitude,
      new Date(),
    ]);

    res.status(200).json({ message: 'Address added successfully', address: result.rows[0] });
  } catch (err) {
    console.error('Adding address failed:', err.stack);
    res.status(500).json({ message: 'Failed to add address' });
  }
});


// Get all addresses for a particular list
router.get('/addresses/:list_id', checkauthtoken, async (req, res) => {
  const listId = req.params.list_id;
  const userId = req.userid;

  try {
    const result = await pool.query(addressQueries.getAddressesByList, [userId, listId]);
    res.status(200).json({ addresses: result.rows });
  } catch (err) {
    console.error('Fetching addresses failed:', err.stack);
    res.status(500).json({ message: 'Failed to fetch addresses' });
  }
});

// Update an address by ID
router.put('/addresses/:id', checkauthtoken, async (req, res) => {
  const addressId = req.params.id;
  const userId = req.userid;
  const { name, latitude, longitude } = req.body;

  if (!name || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await pool.query(addressQueries.updateAddressById, [
      name.trim(),
      latitude,
      longitude,
      addressId,
      userId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    res.status(200).json({ message: 'Address updated successfully' });
  } catch (err) {
    console.error('Updating address failed:', err.stack);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

// Delete an address by ID
router.delete('/addresses/:id', checkauthtoken, async (req, res) => {
  const addressId = req.params.id;
  const userId = req.userid;

  try {
    const result = await pool.query(addressQueries.deleteAddressById, [addressId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('Deleting address failed:', err.stack);
    res.status(500).json({ message: 'Failed to delete address' });
  }
});

module.exports = router;
