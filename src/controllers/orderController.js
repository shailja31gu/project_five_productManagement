const orderModel = require('../models/orderModel');
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const { isValid, isValidRequestBody, isValidObjectId } = require('../util/validator');


const createOrder = async function (req, res) {
    try {

        if (!isValidObjectId(req.params.userId)) return res.status(400).send({ status: false, message: 'enter a valid objectId in params' })

        if (req.user != req.params.userId) return res.status(403).send({ status: false, message: 'you are not authorized' })

        let user = await userModel.findById(req.params.userId);
       
        if (!user) return res.status(404).send({ status: false, message: 'no user found' })

        let data = req.body;
        if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "enter the order details" })

        let totalQuantity = 0;
      
        data.items.map(item => totalQuantity += item.quantity)

        data.totalQuantity = totalQuantity;

        let order = await orderModel.create(data)
        return res.status(201).send({ status: true, message: "order created successfully", data: order })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const upadateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: "false", message: "please enter a valid user Id" })
        }
        const userFound = await userModel.findById(userId)
        if (!userFound) {
            return res.status(404).send({ status: "false", message: "no user found" })
        }
        if (req.user != userId) {
            return res.status(403).send({ status: false, message: "You are not authorized" })
        }
        const orderDetails = req.body
        if (!isValidRequestBody(orderDetails)) {
            return res.status(400).send({ status: "false", message: "please enter required input field" })
        }
        const isOrderAvailable = await orderModel.findOne({ userId: userId })
        if (!isOrderAvailable) {
            return res.status(404).send({ status: "false", message: "No Order available for user" })
        }
        const { orderId, status } = orderDetails
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({ status: "false", message: "please enter a valid order Id" })
        }
        if (!status) {
            return res.status(400).send({ status: "false", message: "please enter a order status" })
        }
        if (isOrderAvailable.cancellable == true) {
            if (isOrderAvailable.status == "pending") {
                const updatedStatus = await orderModel.findOneAndUpdate(
                    { _id: orderId },
                    { $set: { status: status } },
                    { new: true })
                return res.status(200).send({ status: true, message: "order status updated", data: updatedStatus })
            }
            if (isOrderAvailable.status == "completed") {
                return res.status(200).send({
                    status: true,
                    message: "order status already completed,that is why can't update the order status"
                })
            }
            if (isOrderAvailable.status == "cancelled") {
                return res.status(200).send({
                    status: true,
                    message: "order already cancelled, that is why can't update the order status"
                })
            }
        }
        return res.status(200).send({
            status: true,
            message: "order status can't be updated because product is not cancellable"
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { createOrder, upadateOrder }
