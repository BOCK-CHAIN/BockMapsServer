// server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectToDatabase } = require('./config/db.js');
const authRoutes = require('./api/auth.js');
const listRoutes = require('./api/list.js')
const storedAddresses = require('./api/storedAddress.js')

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors()); // allows all origins


// Middlewares
app.use(express.json());
app.use(cookieParser());

// Connect to DB
connectToDatabase();

// Mount routes
app.use('/api', authRoutes);
app.use('/list', listRoutes);
app.use('/storedAddress', storedAddresses);

// Health check route
app.get('/', (req, res) => {
  res.send('Welcome to the MapServer API!');
});

// Start server — binding to 0.0.0.0 so emulator can connect
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server listening at http://0.0.0.0:${port}`);
});
