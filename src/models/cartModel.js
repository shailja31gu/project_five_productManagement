const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        unique:true,
        ref: "user"
    },
      items: [{
      productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          unique: true,
          ref: "Product" },
      
        quantity: {type:Number}
    }],
   
    totalPrice: {type:Number, required:true, default:0},
   
    totalItems: { type:Number, required: true, default:0}
    
},{timestamps: true})  


module.exports = mongoose.model('cart', cartSchema)




