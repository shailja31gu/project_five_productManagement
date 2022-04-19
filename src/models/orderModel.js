const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const orderSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        ref: 'user',
        required: true,
        unique:true
    },
    items: [{
      productId: {
          type: ObjectId,
          ref: 'product',
          required: true,
      },
      quantity: {
          type: Number,
          required: true,
      }
    }],
    totalPrice: {
        type: Number,
        
    },
    totalItems: {
        type: Number,
         },
    totalQuantity: {
        type: Number,
        },
        
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
         default: 'pending'
    },   
    deletedAt: { type: Date },
    isDeleted: {type: Boolean, default: false},

    },{timestamps: true});


  module.exports = mongoose.model('order',orderSchema);



// userId: {ObjectId, refs to User, mandatory},
//   items: [{
//     productId: {ObjectId, refs to Product model, mandatory},
//     quantity: {number, mandatory, min 1}
//   }],
//   totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//   totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
//   totalQuantity: {number, mandatory, comment: "Holds total number of items in the cart"},
//   cancellable: {boolean, default: true},
//   status: {string, default: 'pending', enum[pending, completed, cancled]},
//   deletedAt: {Date, when the document is deleted}, 
//   isDeleted: {boolean, default: false},
//   createdAt: {timestamp},
//   updatedAt: {timestamp},
// }