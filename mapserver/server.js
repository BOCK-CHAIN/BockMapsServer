// server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectToDatabase } = require('./config/db.js');
const authRoutes = require('./api/auth.js');
const authenticateToken = require('./middleware/auth.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // Use the cookie-parser middleware

// Connect to the database
connectToDatabase();

// Public routes for authentication
app.use('/api', authRoutes);


// Start the server
app.get('/', (req, res) => {
  res.send('Welcome to the MapServer API!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});


