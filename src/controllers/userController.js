const userModel = require("../models/userModel")
const aws = require("aws-sdk");
const bcrypt= require("bcrypt");
const { hashSync } = require("bcrypt");
const saltRounds = 10;

//.......validation function.........................................................
const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

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
     if (Object.keys(userData).length = 0) { return res.status(400).send({ status: "false", message: "Please ptovide required input fields" }) }
        let { fname,lname, email, phone, password, address } = userData
        if (!isValid(fname)) { return res.status(400).send({ status: "false", message: "Please enter first name" }) }
        if (!isValid(lname)) { return res.status(400).send({ status: "false", message: "Please enter last" }) }
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
        if (!isValid(password.trim())) { return res.status(400).send({ status: "false", message: "Please enter a valid password" }) }
        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " });
        }   
        address= JSON.parse(address)
        if (Object.keys(address).length = 0) {
            return res.status(400).send({ status: false, message: "Address is required" });
                }
                
               let {shipping,billing}=address
        if (shipping) {
      let {street,city,pincode}=shipping
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
            let {street,city,pincode}=billing
            if (street) {
                if (!isValid(street)) {
                    return res.status(400).send({ status: false, message: 'billing Street Required' })
                }
            }
            if (city) {
                if (!isValid(billing.city)) {
                    return res.status(400).send({ status: false, message: 'Shipping city is Required' });
                }
            }
            if (pincode) {
                if (!isValid(pincode)) {
                    return res.status(400).send({ status: false, message: 'Shipping pincode Required' });
                }
            }
        } else {
            return res.status(400).send({ status: false, message: "Invalid request parameters, billing address cannot be empty" })
        }
        if (files && files.length > 0) {
            profileImage = await uploadFile(files[0])        
        }
        else { res.status(400).send({ message: "No file found" }) }
        const hash= bcrypt.hashSync(password,saltRounds)
        const updatedData = {
            "fname": fname,
            "lname": lname,
            "email": email,
            "phone": phone,
            "password":hash,
            "address": address,
           "profileImage": profileImage,
        }
        let user = await userModel.create(updatedData)
        res.status(201).send({ status: true, message: "user registered succesfully", data: user })
    }
    catch (err) {
        return res.status(500).send({ status: "false", message: err.message })
    }
}

module.exports.registerUser = registerUser
