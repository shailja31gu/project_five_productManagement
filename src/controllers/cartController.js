const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const ProductModel = require('../models/productModel')
const { isValidObjectId } = require('../validator/validator')

const getCart = async (req, res) => {
    try{
        const id = req.params.userId

        if (!isValidObjectId(id)){
            return res.status(400).send({status:false, message:`${id} is not a valid user id`})
        }

        const userFound = await userModel.findOne({_id: id})
        if(!userFound){
            return res.status(404).send({status:false,message: 'user not found'})
        }
        const cartDetails = await cartModel.findOne({ userId: id, isDeleted: false})
            .select({ _id: 1, items: 1, totalPrice: 1, totalItems: 1})


           if (!cartDetails) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        //   if (req.user != id){
        //       return res.status(401).send({status: false, message: "You are not authorized"})
        //   } 
          return res.status(200).send({ status: true, message: 'cart details', data: cartDetails })
    }catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }
}

// const createCart = async function (req, res) {

//     try{
//         const data = req.body
//         if (Object.keys(data).length === 0) {
//             return res.status(400).send({ status: false, message: "please fill all required feilds" })
//         }
       
//         const { userId } =req.params
//         if (!isValidObjectId(userId)){
//             return res.status(400).send({ status: false, message: "please give valid user id" })
//         }

//         const userFound = await userModel.findById(userId)
//         if (!userFound) {
//             return res.status(404).send({ status: false, message: "user not found" })
//         }

//         const productFound = await ProductModel.findOne({_id: productId,isDeleted: false})
//         if (!productFound) {
//             return res.status(404).send({ status: false, message: "product not found" })
//         }
        






//         data.items = Number(data.items)
//        data.productId = productId

       const deleteCart = async (req ,res) => {

        try{
            const userId = req.params.userId

            if(!isValidObjectId(userId)){
             return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            }

            const cartFound = await cartModel.findOne({userId: userId})
            if(!cartFound){
                return res.status(404).send({status: false, message: 'cart not found'})
            }

            const CartDeleted = await cartModel.findOneAndUpdate({ userId: userId }, {$set: {totalItems: 0, totalPrice: 0}})
            return res.status(204).send({ status:true, message: 'cart deleted sucessfully'})
        }
        catch(error){
            return res.status(500).send({status:false, message: error.message})
        }
       }

        

        


module.exports = {getCart,deleteCart}


// - Deletes the cart for the user.
// - Make sure that cart exist.
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - cart deleting means array of items is empty, totalItems is 0, totalPrice is 0.
// - __Response format__
//   - _**On success**_ - Return HTTP status 204. Return a suitable message. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)