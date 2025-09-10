const express = require('express');
const { pool } = require('../config/db.js');
const queries = require('../sql/list.js');
const checkauthtoken = require('../middleware/auth.js');

const router = express.Router();

// Create a new list
router.post('/lists/create', checkauthtoken, async (req, res) => {
  const { name } = req.body;
  const userId = req.userid;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'List name is required' });
  }

  try {
    const result = await pool.query(queries.createList, [userId, name.trim(), new Date()]);
    const newList = result.rows[0];
    res.status(200).json({ message: 'List created successfully', list: newList });
  } catch (err) {
    console.error('List creation failed:', err.stack);
    res.status(500).json({ message: 'Failed to create list' });
  }
});

// Get all lists for a user
router.get('/lists', checkauthtoken, async (req, res) => {
  const userId = req.userid;

  try {
    const result = await pool.query(queries.getListsByUser, [userId]);
    res.status(200).json({ lists: result.rows });
  } catch (err) {
    console.error('Fetching lists failed:', err.stack);
    res.status(500).json({ message: 'Failed to fetch lists' });
  }
});

// Delete a list by ID
router.delete('/lists/:id', checkauthtoken, async (req, res) => {
  const listId = req.params.id;
  const userId = req.userid;

  try {
    const result = await pool.query(queries.deleteListById, [listId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }
    res.status(200).json({ message: 'List deleted successfully' });
  } catch (err) {
    console.error('Deleting list failed:', err.stack);
    res.status(500).json({ message: 'Failed to delete list' });
  }
});

// Update a list by ID
router.put('/lists/:id', checkauthtoken, async (req, res) => {
  const listId = req.params.id;
  const userId = req.userid;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'List name is required' });
  }

  try {
    const result = await pool.query(queries.updateListById, [name.trim(), listId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'List not found or unauthorized' });
    }
    res.status(200).json({ message: 'List updated successfully' });
  } catch (err) {
    console.error('Updating list failed:', err.stack);
    res.status(500).json({ message: 'Failed to update list' });
  }
});


module.exports = router;
