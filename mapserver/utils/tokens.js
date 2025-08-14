// utils/tokens.js
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

function generateAuthToken(userId) {
    return jwt.sign({ userid: userId }, JWT_SECRET_KEY, { expiresIn: '1d' });
}

function generateRefreshToken(userId) {
    return jwt.sign({ userid: userId }, JWT_REFRESH_SECRET_KEY, { expiresIn: '1d' });
}

module.exports = {
    generateAuthToken,
    generateRefreshToken,
};