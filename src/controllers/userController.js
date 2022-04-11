const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcyrpt = require('bcrypt');
const { isValid, isValidRequestBody, isValidObjectId } = require('../validator/validator');


const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/

const userLogin = async (req, res) => {
    try {
        const loginDetails = req.body;
        if (!isValidRequestBody(loginDetails)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }
        const { email, password } = loginDetails;

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "Email should be valid email" });
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).send({ status: false, message: "Password should be valid Password" });
        }
        const user = await userModel.findOne({ email, password });
        if (!user) {
            return res.status(404).send({ status: false, message: "User doesn't exists. Please register first" })
        }

        if (!user.email) {
            return res.status(404).send({ status: false, message: "Email and Password not matched" }); // wrong email
        }

        bcrypt.compare(password, hash, function (err, res) {

            if (res) {
                const token = jwt.sign({
                    userId: user._id
                }, 'Group03', { expiresIn: 60 * 60 });
                res.setHeader("Authorization", token);
                return res.status(200).send({ 'status': true, message: "User login successfull", data: { token, userId: user._id } });

            }else {
                return res.status(401).send({status: false, message: err.message});
            }
            // if res == true, password matched
            // else wrong password
        });

        // if (!user.password) {
        //     return res.status(404).send({ status: false, message: "Email and Password not matched" }); // wrong password
        // }


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

module.exports = { userLogin }


// bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
    // if res == true, password matched
    // else wrong password
 // });