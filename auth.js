const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];
        try {
            const verifiedStatus = jwt.verify(token, `${process.env.secretKey}`);
            if (verifiedStatus.user) {
                req.user = verifiedStatus.user;
                next();
            } else {
                return res.redirect('/login')
            }

        } catch (error) {
            res.redirect('/login')

        }

    } else {
        res.redirect('/login')
    }

}

module.exports = auth;