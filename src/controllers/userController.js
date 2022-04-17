const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");

const saltRounds = 10;  //
const { isValid, isValidRequestBody, isValidObjectId } = require('../validator/validator');
const { hash } = require('bcrypt');  //


const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/


//---------AWS S3..............................................................
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: "2006-03-01" })
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "Minakshi/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            return resolve(data.Location)
        }
        )
    }
    )
}

///...............................................................................

const registerUser = async function (req, res) {
    try {
        const userData = req.body
        const files = req.files
        if (Object.keys(userData).length = 0) { return res.status(400).send({ status: "false", message: "Please provide required input fields" }) }
        let { fname, lname, email, phone, password, address } = userData
        if (!isValid(fname)) { return res.status(400).send({ status: "false", message: "Please enter first name" }) }
        if (!isValid(lname)) { return res.status(400).send({ status: "false", message: "Please enter last name" }) }
        if (!isValid(email)) { return res.status(400).send({ status: "false", message: "Please enter email" }) }

        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }
        let duplicateEmail = await userModel.findOne({ email: email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, message: `Email Already Present` });
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone" });
        }
        if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
            return res.status(400).send({ status: false, message: `Mobile should be a valid number` });
        }
        let duplicatePhone = await userModel.findOne({ phone: phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, message: `Phone Number Already Present` });
        }
        if (!isValid(password)) { return res.status(400).send({ status: "false", message: "Please enter a valid password" }) }
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " });
        }
        address = JSON.parse(address)  //
        if (Object.keys(address).length = 0) {
            return res.status(400).send({ status: false, message: "Address is required" });
        }

        let { shipping, billing } = address
        if (shipping) {
            let { street, city, pincode } = shipping
            if (street) {
                if (!isValid(street)) {
                    return res.status(400).send({ status: false, message: 'Shipping Street Required' });
                }
            }

            if (city) {
                if (!isValid(city)) {
                    return res.status(400).send({ status: false, message: 'Shipping city is Required' });
                }
            }
            if (pincode) {
                if (!isValid(pincode)) {
                    return res.status(400).send({ status: false, message: 'Shipping pincode Required' });
                }
            }
        } else {
            return res.status(400).send({ status: false, message: "Invalid request parameters, Shipping address cannot be empty" })
        }
        if (billing) {
            // let { street, city, pincode } = billing

            if (billing.street) {
                if (!isValid(billing.street)) {
                    return res.status(400).send({ status: false, message: 'billing Street Required' })
                }
            }
            if (billing.city) {
                if (!isValid(billing.city)) {
                    return res.status(400).send({ status: false, message: 'Shipping city is Required' });
                }
            }
            if (billing.pincode) {
                if (!isValid(billing.pincode)) {
                    return res.status(400).send({ status: false, message: 'Shipping pincode Required' });
                }
            }
        } else {
            return res.status(400).send({ status: false, message: "Invalid request parameters, billing address cannot be empty" })
        }
        if (files && files.length > 0) {
            imageUrl = await uploadFile(files[0])
        
        }
        else { return res.status(400).send({ message: "No file found" }) }
        const hash = bcrypt.hashSync(password, saltRounds)  //
        const createdData = {
            "fname": fname,
            "lname": lname,
            "email": email,
            "phone": phone,
            "password": hash,
            "address": address,
            "profileImage": imageUrl,
        }
        let user = await userModel.create(createdData)
        return res.status(201).send({ status: true, message: "user registered succesfully", data: user })
    }
    catch (err) {
        return res.status(500).send({ status: "false", message: err.message })
    }
}


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
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ status: false, message: "User doesn't exists. Please register first" })
        }
        if (!user.email) {
            return res.status(404).send({ status: false, message: "Email and Password not matched" }); // wrong email
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).send({ status: false, message: "Password not matched" });
        }
        const token = jwt.sign({
            userId: user._id
        }, 'Group03', { expiresIn: 60 * 60 });
        res.setHeader("Authorization", token);

        return res.status(200).send({ 'status': true, message: "User login successfull", data: { userId: user._id, token } });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}
/////.........get user........................................................................
const getUser = async (req, res) => {
    try {
        const id = req.params.userId

        if (!isValidObjectId(id)) {
            res.status(400).send({ status: false, message: `${id} is not a valid user id` })
            return
        }
        const userDetails = await userModel.findOne({ _id: id, isDeleted: false })
            .select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1 })

        if (!userDetails) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        if (req.user != id) {
            return res.status(401).send({ status: false, message: "You are not authorized" })
        }
        return res.status(200).send({ status: true, message: 'User profile details', data: userDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
////////////////////...........update user..........................................................

const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: ' invalid user id' })
        }
        const userFound = await userModel.findOne({ _id: userId , isDeleted: false})
        if (!userFound) {
            return res.status(404).send({ status: false, message: 'no user exist with such user id' })
        }
        if (userFound._id != req.user) {
            return res.status(401).send({ status: false, message: 'Unauthorized user to upade the profile' })
        }
        const userData = req.body
        const files = req.files

        let { fname, lname, email, phone, password, address, profileImage } = userData
        if (fname) {
            if (!isValid(fname)) {
                { return res.status(400).send({ status: "false", message: "Please enter first name" }) }
            }
        }
        if (lname) {
            if (!isValid(lname)) {
                { return res.status(400).send({ status: "false", message: "Please enter last name" }) }
            }
        }
        if (email) {
            if (!isValid(email)) {
                { return res.status(400).send({ status: "false", message: "Please enter first name" }) }
            }

            if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, message: `Email should be a valid email address` });
            }
            let duplicateEmail = await userModel.findOne({ email: email })
            if (duplicateEmail) {
                return res.status(400).send({ status: false, message: `Email Already Exist` });
            }
        }
        if (phone) {
            if (!isValid(phone)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone" });
            }
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Mobile should be a valid number` });
            }
            let duplicatePhone = await userModel.findOne({ phone: phone })
            if (duplicatePhone) {
                return res.status(400).send({ status: false, message: `Phone Number Already Present` });
            }
        }
        if (password) {
            if (!isValid(password)) { return res.status(400).send({ status: "false", message: "Please enter a valid password" }) }
            if (!(password.length >= 8 && password.length <= 15)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " });
            }
            var hash = bcrypt.hashSync(password, saltRounds)
        }
        if (address) {
            address = JSON.parse(address)

            if (address.shipping) {
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: 'Shipping Street Required' });
                    }
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: 'Shipping city is Required' });
                    }
                }
                if (address.shipping.pincode) {
                    if (!isValid(address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: 'Shipping pincode Required' });
                    }
                }
            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: 'billing Street Required' })
                    }
                }
                if (address.billing.city) {
                    if (!isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: 'billing city is Required' });
                    }
                }
                if (address.billing.pincode) {
                    if (!isValid(address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: 'billing pincode Required' });
                    }
                }
            }
        }

        if (files) {
            if (files.length > 0) {
                profileImage = await uploadFile(files[0])
            }
        }
        const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname,
                lname: lname,
                email: email,
                phone: phone,
                password: hash,
                address: address,
                profileImage: profileImage,
            }
        }, { new: true })
        return res.status(200).send({ status: true, message: "user updated succesfully", data: updatedUser })
    }


    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { userLogin, registerUser, getUser, updateUser }

