const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const { isValid, isValidRequestBody, isValidObjectId } = require('../util/validator');

const addToCart = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId
        const data = req.body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please enter required input fields" });
        }
        if (!isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }
        const { userId, items: { productId, quantity } } = data

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }
        if (req.user != userIdFromParams) {
            return res.status(403).send({ status: false, msg: 'you are not authorized' })
        }
        const userFound = await userModel.findById(userIdFromParams);

        if (!userFound) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }
        if (!isValid(quantity)) {
            return res.status(400).send({ status: false, messege: "please provide quantity" })
        }

        if ((isNaN(Number(quantity)))) {
            return res.status(400).send({ status: false, message: 'quantity should be a valid number' })         //price should be valid number
        }

        if (quantity < 0) {
            return res.status(400).send({ status: false, message: 'quantity can not be less than zero' })    //price should be valid number
        }

        const isOldUser = await cartModel.findOne({ userId: userIdFromParams });

        if (!isOldUser) {
            const newCart = {
                userId: userIdFromParams,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: (findProduct.price) * quantity,
                totalItems: 1
            }

            const saveCart = await cartModel.create(newCart)
            return res.status(201).send({ status: true, message: "cart created successfully", data: saveCart })
        }

        if (isOldUser) {
            const newTotalPrice = (isOldUser.totalPrice) + ((findProduct.price) * quantity)
            const items = isOldUser.items;
            const length = isOldUser.items.length

            for (let i = 0; i < length; i++) {
                if (items[i].productId.toString() === productId) {
                    items[i].quantity += quantity
                    var newCartData = {
                        items: items,
                        totalPrice: newTotalPrice,
                        totalItems: items.length
                    }
                    const saveData = await cartModel.findOneAndUpdate(
                        { userId: userIdFromParams },
                        newCartData, { new: true })
                    return res.status(201).send({ status: true, message: "product added to the cart successfully", data: saveData })
                }
            }
            let newTotalItems = isOldUser.totalItems + 1
            items.push({ productId: productId, quantity: quantity })

            let updatedCart = { items: items, totalPrice: newTotalPrice, totalItems: newTotalItems }
            let newCartAfterUpdation = await cartModel.findOneAndUpdate(
                { _id: isOldUser._id },
                updatedCart, { new: true })
            return res.status(200).send({ status: true, message: `Product added successfully`, data: newCartAfterUpdation })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

const removeProductFromCart = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId
        const data = req.body
        const { productId, cartId, removeProduct } = data

        if (!isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }

        const userFound = await userModel.findById(userIdFromParams);

        if (!userFound) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (req.user != userIdFromParams) {
            return res.status(403).send({ status: false, message: "user not authorized.", });
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const productFound = await productModel.findById(productId);

        if (!productFound) {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }

        if (productFound.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "product is deleted" });
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, messege: "please provide cartId" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" });
        }
        const cartFound = await cartModel.findById(cartId);

        if (!cartFound) {
            return res.status(404).send({ status: false, message: 'cart not found.' });
        }

        const isProductInCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } });

        if (!isProductInCart) {
            return res.status(404).send({ status: false, message: 'product not found in the cart.' });
        }

        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, messege: "please provide items to delete" })
        }

        if ((isNaN(Number(removeProduct)))) {
            return res.status(400).send({ status: false, message: 'removeProduct should be a valid number' })
        }

        if ((removeProduct != 0) && (removeProduct != 1)) {
            return res.status(400).send({ status: false, message: 'removeProduct should be 0 or 1' })
        }

        let findQuantity = cartFound.items.find(x => x.productId.toString() === productId)

        if (removeProduct == 0) {
            let totalAmount = cartFound.totalPrice - (productFound.price * findQuantity.quantity)
            let quantity = cartFound.totalItems - 1
            let newCart = await cartModel.findOneAndUpdate(
                { _id: cartId },
                {
                    $pull: { items: { productId: productId } },
                    $set: { totalPrice: totalAmount, totalItems: quantity }
                }, { new: true })

            return res.status(200).send({
                status: true,
                message: 'product has been removed from the cart', data: newCart
            })
        }

        if (removeProduct == 1) {
            let totalAmount = cartFound.totalPrice - productFound.price
            let items = cartFound.items
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) {
                    items[i].quantity = items[i].quantity - 1
                    if (items[i].quantity == 0) {

                        var noOfItems = cartFound.totalItems - 1
                        let newCart = await cartModel.findOneAndUpdate(
                            { _id: cartId },
                            {
                                $pull: { items: { productId: productId } },
                                $set: { totalPrice: totalAmount, totalItems: noOfItems }
                            }, { new: true })
                        return res.status(200).send({
                            status: true,
                            message: 'product has been removed from the cart', data: newCart
                        })
                    }
                }
            }
            let data = await cartModel.findOneAndUpdate(
                { _id: cartId },
                { totalPrice: totalAmount, items: items }, { new: true })

            return res.status(200).send({ status: true, message: 'product updated successfully.', data: data })
        }
    }
    catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}


const getCart = async (req, res) => {
    try {
        const id = req.params.userId

        if (!isValidObjectId(id)) {
            return res.status(400).send({ status: false, message: `${id} is not a valid user id` })
        }

        const userFound = await userModel.findOne({ _id: id })
        if (!userFound) {
            return res.status(404).send({ status: false, message: 'user not found' })
        }
        const cartDetails = await cartModel.findOne({ userId: id, isDeleted: false })
            .select({ _id: 1, items: 1, totalPrice: 1, totalItems: 1 })

        if (!cartDetails) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        if (req.user != id) {
            return res.status(401).send({ status: false, message: "You are not authorized" })
        }
        return res.status(200).send({ status: true, message: 'cart details', data: cartDetails })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteCart = async (req, res) => {

    try {
        const userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }
        const userFound = await userModel.findById(userId)
        if (!userFound) {
            return res.status(404).send({ status: false, message: 'user not found' })
        }
        if (req.user != userId) {
            return res.status(401).send({ status: false, message: "You are not authorized" })
        }
        const cartFound = await cartModel.findOne({ userId: userId })
        if (!cartFound) {
            return res.status(404).send({ status: false, message: 'cart not found' })
        }

        const CartDeleted = await cartModel.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })
        return res.status(204).send({ status: true, message: 'cart deleted sucessfully' })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { addToCart, removeProductFromCart, getCart, deleteCart }