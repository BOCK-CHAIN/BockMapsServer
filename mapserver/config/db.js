const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectToDatabase = () => {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to AWS PostgreSQL database!');
    release();
  });
};

module.exports = {
  pool,
  connectToDatabase
};
