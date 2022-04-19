const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId


const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        productId: {
            type: ObjectId,
            ref: "Product",
        },
        quantity: {
            type:Number
        }
    }],
    totalPrice: { type: Number },
    totalItems: { type: Number },
    totalQuantity: { type: Number },
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "completed", "cancelled"]
    },
     deletedAt: {type:Date},
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema);
