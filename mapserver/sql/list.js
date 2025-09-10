module.exports = {
  createList: `
    INSERT INTO user_lists (user_id, "name", created_at)
    VALUES ($1, $2, $3)
    RETURNING id, "name", created_at;
  `,
  getListsByUser: `
    SELECT id, "name", created_at
    FROM user_lists
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `,
  deleteListById: `
    DELETE FROM user_lists
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `,
  updateListById: `
    UPDATE user_lists
    SET "name" = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, "name";
  `,

};
