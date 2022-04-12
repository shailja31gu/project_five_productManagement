const jwt = require("jsonwebtoken")


const authorisation = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).send({ status: false, message: 'important header missing' })
        }
        const bearerToken =token.split(' ')[1]
       const decodedToken = jwt.verify(bearerToken, 'Group03')
        req.user = decodedToken.userId;
        next();
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

module.exports = { authorisation }
