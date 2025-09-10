module.exports = {
  createAddress: `
    INSERT INTO stored_addresses (user_id, list_id, "name", latitude, longitude, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, "name", latitude, longitude, created_at;
  `,

  getAddressesByList: `
    SELECT id, "name", latitude, longitude, created_at
    FROM stored_addresses
    WHERE user_id = $1 AND list_id = $2
    ORDER BY created_at DESC;
  `,

  updateAddressById: `
    UPDATE stored_addresses
    SET "name" = $1, latitude = $2, longitude = $3
    WHERE id = $4 AND user_id = $5
    RETURNING id, "name", latitude, longitude;
  `,

  deleteAddressById: `
    DELETE FROM stored_addresses
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `,
};
