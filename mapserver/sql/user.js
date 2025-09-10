// sql/queries.js

module.exports = {
  registerUser: `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at;
  `,
  findUserByEmail: `
    SELECT id, email, password_hash
    FROM users
    WHERE email = $1;
  `,
  findUserById: `
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE id = $1;
  `,
  findByIdAndUpdate: `
    UPDATE users
    SET email = $1
    WHERE id = $2
    RETURNING id, email, created_at
  `,
  updateUserPassword: `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
  `
};