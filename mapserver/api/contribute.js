// api/contribute.js
const express = require('express');
const { pool } = require('../config/db.js');
const queries = require('../sql/contribute.js');
const checkauthtoken = require('../middleware/auth.js');

const router = express.Router();

// Validate required fields for place contribution
function validatePlaceData(data) {
  const requiredFields = [
    'name', 'short_description', 'category', 'email', 'phone_number',
    'website', 'postal_address', 'exact_address', 'landmark',
    'opening_hours', 'closing_hours', 'services', 'price_range'
  ];

  const missingFields = [];
  const invalidFields = [];

  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      missingFields.push(field);
    }
  }

  // Email validation
  if (data.email && typeof data.email === 'string' && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      invalidFields.push('email format is invalid');
    }
  }

  // Phone validation (basic)
  if (data.phone_number && typeof data.phone_number === 'string' && data.phone_number.trim() !== '') {
    const cleanPhone = data.phone_number.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
      invalidFields.push('phone number should be between 7-15 digits and contain only digits');
    }
  }

  // Website validation (basic URL check)
  if (data.website && typeof data.website === 'string' && data.website.trim() !== '') {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(data.website.trim())) {
      invalidFields.push('website URL format is invalid');
    }
  }

  return { missingFields, invalidFields };
}

router.post('/contribute-place', async (req, res) => {
  try {
    // Accept userId from middleware (if present) OR from request body
    const userId = req.userid || req.body.user_id;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing user identification',
        message: 'Provide a valid user_id in body or authenticate to send a contribution'
      });
    }

    const placeData = req.body;

    // Validate input data
    const { missingFields, invalidFields } = validatePlaceData(placeData);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing_fields: missingFields,
        message: `Please provide: ${missingFields.join(', ')}`
      });
    }

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid field data',
        invalid_fields: invalidFields,
        message: `Invalid data: ${invalidFields.join(', ')}`
      });
    }

    // Trim all string values
    const cleanData = {
      user_id: userId,
      name: placeData.name.trim(),
      short_description: placeData.short_description.trim(),
      category: placeData.category.trim(),
      email: placeData.email.trim().toLowerCase(),
      phone_number: placeData.phone_number.trim(),
      website: placeData.website.trim(),
      postal_address: placeData.postal_address.trim(),
      exact_address: placeData.exact_address.trim(),
      landmark: placeData.landmark.trim(),
      opening_hours: placeData.opening_hours.trim(),
      closing_hours: placeData.closing_hours.trim(),
      services: placeData.services.trim(),
      price_range: placeData.price_range.trim()
    };

    // If you want to enforce the user exists, uncomment this block.
    // (Currently, we try the insert and handle FK errors.)
    /*
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [cleanData.user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }
    */

    // Insert the place contribution
    const result = await pool.query(queries.createPlace, [
      cleanData.user_id,
      cleanData.name,
      cleanData.short_description,
      cleanData.category,
      cleanData.email,
      cleanData.phone_number,
      cleanData.website,
      cleanData.postal_address,
      cleanData.exact_address,
      cleanData.landmark,
      cleanData.opening_hours,
      cleanData.closing_hours,
      cleanData.services,
      cleanData.price_range
    ]);

    const newPlace = result.rows[0];

    res.status(201).json({
      message: 'Place contributed successfully',
      place: {
        place_id: newPlace.place_id,
        user_id: newPlace.user_id,
        name: newPlace.name,
        category: newPlace.category,
        created_at: newPlace.created_at
      }
    });

  } catch (err) {
    console.error('Place contribution failed:', err);

    // Handle specific database errors
    if (err.code === '23503') { // foreign key violation
      return res.status(400).json({
        error: 'Invalid user reference',
        message: 'User ID does not exist'
      });
    }

    if (err.code === '23505') { // unique violation
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'A similar place contribution already exists'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit place contribution'
    });
  }
});

// Keep other routes protected with auth middleware as before
router.get('/user-contributions', checkauthtoken, async (req, res) => {
  try {
    const userId = req.userid;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await pool.query(queries.getUserContributions, [userId, parseInt(limit), offset]);
    const countResult = await pool.query(queries.getUserContributionsCount, [userId]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      message: 'User contributions retrieved successfully',
      data: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_count: totalCount,
        has_next: parseInt(page) < totalPages,
        has_prev: parseInt(page) > 1
      }
    });

  } catch (err) {
    console.error('Failed to retrieve user contributions:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve contributions'
    });
  }
});

router.get('/place/:placeId', checkauthtoken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const userId = req.userid;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(placeId)) {
      return res.status(400).json({
        error: 'Invalid place ID format',
        message: 'Place ID must be a valid UUID'
      });
    }

    const result = await pool.query(queries.getPlaceByIdAndUser, [placeId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Place not found',
        message: 'Place does not exist or you do not have permission to view it'
      });
    }

    res.status(200).json({
      message: 'Place retrieved successfully',
      place: result.rows[0]
    });

  } catch (err) {
    console.error('Failed to retrieve place:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve place'
    });
  }
});

router.put('/place/:placeId', checkauthtoken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const userId = req.userid;
    const updateData = req.body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(placeId)) {
      return res.status(400).json({
        error: 'Invalid place ID format',
        message: 'Place ID must be a valid UUID'
      });
    }

    const existingPlace = await pool.query(queries.getPlaceByIdAndUser, [placeId, userId]);
    if (existingPlace.rows.length === 0) {
      return res.status(404).json({
        error: 'Place not found',
        message: 'Place does not exist or you do not have permission to update it'
      });
    }

    const { missingFields, invalidFields } = validatePlaceData(updateData);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing_fields: missingFields
      });
    }

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid field data',
        invalid_fields: invalidFields
      });
    }

    const result = await pool.query(queries.updatePlace, [
      updateData.name.trim(),
      updateData.short_description.trim(),
      updateData.category.trim(),
      updateData.email.trim().toLowerCase(),
      updateData.phone_number.trim(),
      updateData.website.trim(),
      updateData.postal_address.trim(),
      updateData.exact_address.trim(),
      updateData.landmark.trim(),
      updateData.opening_hours.trim(),
      updateData.closing_hours.trim(),
      updateData.services.trim(),
      updateData.price_range.trim(),
      placeId,
      userId
    ]);

    res.status(200).json({
      message: 'Place updated successfully',
      place: result.rows[0]
    });

  } catch (err) {
    console.error('Failed to update place:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update place'
    });
  }
});

router.delete('/place/:placeId', checkauthtoken, async (req, res) => {
  try {
    const { placeId } = req.params;
    const userId = req.userid;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(placeId)) {
      return res.status(400).json({
        error: 'Invalid place ID format',
        message: 'Place ID must be a valid UUID'
      });
    }

    const result = await pool.query(queries.deletePlace, [placeId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Place not found',
        message: 'Place does not exist or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      message: 'Place deleted successfully',
      deleted_place: result.rows[0]
    });

  } catch (err) {
    console.error('Failed to delete place:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete place'
    });
  }
});

module.exports = router;
