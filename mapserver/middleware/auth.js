const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || 'your_jwt_refresh_secret';

function checkauthtoken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ ok: false, message: 'user is not logged in' });
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, message: 'token invalid or expired' });
        } else {
            req.userid = decoded.id; // make sure you use the same key as in token
            next();
        }
    });
}

module.exports = checkauthtoken;
