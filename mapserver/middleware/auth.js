// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

function checkauthtoken(req, res, next) {
    const authtoken = req.cookies.authtoken;
    const refreshtoken = req.cookies.refreshtoken;

    if (!authtoken || !refreshtoken) {
        return res.status(400).json({
            ok: false,
            message: 'user is not logged in'
        });
    }

    jwt.verify(authtoken, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            jwt.verify(refreshtoken, JWT_REFRESH_SECRET_KEY, (referr, refdecoded) => {
                if (referr) {
                    return res.status(400).json({
                        ok: false,
                        message: 'both token are invalid'
                    });
                } else {
                    const newauthtoken = jwt.sign({ userid: refdecoded.userid }, JWT_SECRET_KEY, { expiresIn: '1d' });
                    const newrefreshtoken = jwt.sign({ userid: refdecoded.userid }, JWT_REFRESH_SECRET_KEY, { expiresIn: '1d' });

                    res.cookie('authtoken', newauthtoken, { httpOnly: true });
                    res.cookie('refreshtoken', newrefreshtoken, { httpOnly: true });

                    req.userid = refdecoded.userid;
                    next();
                }
            });
        } else {
            req.userid = decoded.userid;
            next();
        }
    });
}

module.exports = checkauthtoken;