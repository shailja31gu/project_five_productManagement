const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")


const authentication = async (req, res, next) => {
    try {
        let token = 'Bearer Token'//["Authorization"];
        if (!token) {
            return res.status(401).send({ status: false, message: 'important header missing' })
        }
        // let decodedToken = jwt.verify(token, 'Group03')
        // if (!decodedToken) return res.status(401).send({ status: false, message: 'token is not valid' })
        next();
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
   
}


const authorisation = async (req, res, next) => {
    try {
        let token = req.Authorization//['Authorization']
        let decodedToken = jwt.verify(token, 'Group03')
        let userLoggingIn = req.params.userId
        let userLoggedIn = (decodedToken.id)

        let value = await userModel.findById(userLoggingIn)
        if (value.userId != userLoggedIn)
            return res.status(403).send({ status: false, message: 'you are not allowed to modify' })
            next();
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
    
}
module.exports = { authentication , authorisation}
