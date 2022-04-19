const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const orderModel=require("../models/orderModel")
const { isValid, isValidRequestBody, isValidObjectId } = require('../validator/validator');


const createOrder= async function(req,res){
    try{
       const userId=req.params.userId
       if(!isValidObjectId(userId)){
           return res.status(400).send({status:"false", message:"please enter a valid user Id"})
       } 
       const userFound= await userModel.findById(userId)
       if(!userFound){
           return res.status(404).send({status:"false", message:"no user found"})
       }
    //    if (req.user != userId) {
    //     return res.status(401).send({ status: false, message: "You are not authorized" })
    //   }
      const cartDetails=req.body
       if(!isValidRequestBody(cartDetails)){
        return res.status(400).send({status:"false", message:"please enter required input field"})
       }
      
      let {productId,quantity,totalPrice,totalItems,cancellable,status}=cartDetails
      if(!isValidObjectId(productId)){
        return res.status(400).send({status:"false", message:"please enter a valid user Id"})
    } 

    if(!isValid(quantity)){
        return res.status(400).send({status:"false", message:"please enter quantity"})
    }

    if(isNaN(quantity)){
        return res.status(400).send({status:"false", message:"Quantity should be a numeric value greater than zero"})
    }
    if(quantity<=0){
        return res.status(400).send({status:"false", message:"Quantity should be a numeric value greater than zero"})
    }
    if(!isValid(totalItems)){
        return res.status(400).send({status:"false", message:"please enter total items"})
    }

    if(isNaN(totalItems)){
        return res.status(400).send({status:"false", message:"total items should be a numeric value greater than zero"})
    }
    if(totalItems<=0){
        return res.status(400).send({status:"false", message:"total items should be a numeric value greater than zero"})
    }

    if(!isValid(totalPrice)){
        return res.status(400).send({status:"false", message:"please enter price"})
    }

    if(isNaN(totalPrice)){
        return res.status(400).send({status:"false", message:"price should be a numeric value greater than zero"})
    }
    if(totalPrice<=0){
        return res.status(400).send({status:"false", message:"price should be a numeric value greater than zero"})
    }
  //const product= await productModel.findById(productId)

     if(cancellable){
         if(typeof cancellable!==Boolean){
             return res.status(400).send({status:"false",message:"cancellable can only be 'true' or 'false' "})
         }
     }
   if(status){
       if(!(status=="pending"||status=="completed"||status=="cancelled")){
       return res.status(400).send({status:"false", message:"status can only be 'pending', 'completed', 'cancelled'"})
       }
   }

   let orderDetails = {
    userId : userId,
    items :  [{productId:productId,quantity:quantity}],
    totalPrice:totalPrice,
    totalItems:totalItems,
    cancellable,
    status
}
const saveorder=await orderModel.create(orderDetails)
return res.status(201).send({status:"true", message:"order created successfully", data:saveorder})
    }
    catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}

///........... upadate order.......................

const upadateOrder= async function(req,res){
    const userId=req.params.userId
    if(!isValidObjectId(userId)){
        return res.status(400).send({status:"false", message:"please enter a valid user Id"})
    } 
    const userFound= await userModel.findById(userId)
    if(!userFound){
        return res.status(404).send({status:"false", message:"no user found"})
    }
 //    if (req.user != userId) {
 //     return res.status(401).send({ status: false, message: "You are not authorized" })
 //   }
   const orderDetails=req.body
    if(!isValidRequestBody(orderDetails)){
     return res.status(400).send({status:"false", message:"please enter required input field"})
    }

}

module.exports.createOrder=createOrder
module.exports.upadateOrder=upadateOrder