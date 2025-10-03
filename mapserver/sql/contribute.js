module.exports = {
  // Create a new place contribution
  createPlace: `
    INSERT INTO contribute_places (
      user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING place_id, user_id, name, category, created_at;
  `,

  // Get all contributions by a specific user with pagination
  getUserContributions: `
    SELECT 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at
    FROM contribute_places
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Count total contributions by a specific user
  getUserContributionsCount: `
    SELECT COUNT(*) as count
    FROM contribute_places
    WHERE user_id = $1;
  `,

  // Get a specific place by ID and user (ensures user owns the place)
  getPlaceByIdAndUser: `
    SELECT 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at
    FROM contribute_places
    WHERE place_id = $1 AND user_id = $2;
  `,

  // Get a place by ID only (for admin or public access)
  getPlaceById: `
    SELECT 
      cp.place_id, cp.user_id, cp.name, cp.short_description, cp.category, 
      cp.email, cp.phone_number, cp.website, cp.postal_address, cp.exact_address, 
      cp.landmark, cp.opening_hours, cp.closing_hours, cp.services, cp.price_range, 
      cp.created_at, cp.updated_at,
      u.email as contributor_email
    FROM contribute_places cp
    LEFT JOIN users u ON cp.user_id = u.id
    WHERE cp.place_id = $1;
  `,

  // Update a place contribution
  updatePlace: `
    UPDATE contribute_places
    SET 
      name = $1,
      short_description = $2,
      category = $3,
      email = $4,
      phone_number = $5,
      website = $6,
      postal_address = $7,
      exact_address = $8,
      landmark = $9,
      opening_hours = $10,
      closing_hours = $11,
      services = $12,
      price_range = $13,
      updated_at = CURRENT_TIMESTAMP
    WHERE place_id = $14 AND user_id = $15
    RETURNING 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at;
  `,

  // Delete a place contribution
  deletePlace: `
    DELETE FROM contribute_places
    WHERE place_id = $1 AND user_id = $2
    RETURNING place_id, name, category, created_at;
  `,

  // Search places by category
  searchPlacesByCategory: `
    SELECT 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at
    FROM contribute_places
    WHERE LOWER(category) LIKE LOWER($1)
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Search places by name or description
  searchPlacesByText: `
    SELECT 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at
    FROM contribute_places
    WHERE 
      LOWER(name) LIKE LOWER($1) OR 
      LOWER(short_description) LIKE LOWER($1) OR
      LOWER(services) LIKE LOWER($1)
    ORDER BY 
      CASE 
        WHEN LOWER(name) LIKE LOWER($1) THEN 1
        WHEN LOWER(short_description) LIKE LOWER($1) THEN 2
        ELSE 3
      END,
      created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Get all places with pagination (for admin or public view)
  getAllPlaces: `
    SELECT 
      cp.place_id, cp.user_id, cp.name, cp.short_description, cp.category, 
      cp.email, cp.phone_number, cp.website, cp.postal_address, cp.exact_address, 
      cp.landmark, cp.opening_hours, cp.closing_hours, cp.services, cp.price_range, 
      cp.created_at, cp.updated_at,
      u.email as contributor_email
    FROM contribute_places cp
    LEFT JOIN users u ON cp.user_id = u.id
    ORDER BY cp.created_at DESC
    LIMIT $1 OFFSET $2;
  `,

  // Count total places
  getTotalPlacesCount: `
    SELECT COUNT(*) as count
    FROM contribute_places;
  `,

  // Get places by location (using postal address or exact address)
  searchPlacesByLocation: `
    SELECT 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at
    FROM contribute_places
    WHERE 
      LOWER(postal_address) LIKE LOWER($1) OR 
      LOWER(exact_address) LIKE LOWER($1) OR
      LOWER(landmark) LIKE LOWER($1)
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `,

  // Check if a place with similar details already exists (duplicate prevention)
  checkDuplicatePlace: `
    SELECT place_id, name, exact_address
    FROM contribute_places
    WHERE 
      LOWER(name) = LOWER($1) AND 
      LOWER(exact_address) = LOWER($2) AND
      user_id = $3;
  `,

  // Get recent contributions (last 24 hours)
  getRecentContributions: `
    SELECT 
      cp.place_id, cp.user_id, cp.name, cp.category, cp.created_at,
      u.email as contributor_email
    FROM contribute_places cp
    LEFT JOIN users u ON cp.user_id = u.id
    WHERE cp.created_at >= NOW() - INTERVAL '24 hours'
    ORDER BY cp.created_at DESC
    LIMIT $1;
  `,

  // Update only specific fields (partial update)
  updatePlacePartial: `
    UPDATE contribute_places
    SET 
      name = COALESCE($1, name),
      short_description = COALESCE($2, short_description),
      category = COALESCE($3, category),
      email = COALESCE($4, email),
      phone_number = COALESCE($5, phone_number),
      website = COALESCE($6, website),
      postal_address = COALESCE($7, postal_address),
      exact_address = COALESCE($8, exact_address),
      landmark = COALESCE($9, landmark),
      opening_hours = COALESCE($10, opening_hours),
      closing_hours = COALESCE($11, closing_hours),
      services = COALESCE($12, services),
      price_range = COALESCE($13, price_range),
      updated_at = CURRENT_TIMESTAMP
    WHERE place_id = $14 AND user_id = $15
    RETURNING 
      place_id, user_id, name, short_description, category, email, phone_number,
      website, postal_address, exact_address, landmark, opening_hours,
      closing_hours, services, price_range, created_at, updated_at;
  `,

  // Get statistics for user contributions
  getUserStats: `
    SELECT 
      COUNT(*) as total_contributions,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as contributions_last_30_days,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as contributions_last_7_days,
      MIN(created_at) as first_contribution,
      MAX(created_at) as latest_contribution
    FROM contribute_places
    WHERE user_id = $1;
  `
};
