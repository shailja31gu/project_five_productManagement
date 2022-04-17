const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const { authorisation } = require('../middleware/authorization');


// User Api----
router.post('/register', userController.registerUser);
router.post('/login', userController.userLogin);
router.get('/user/:userId', authorisation, userController.getUser)
router.put('/user/:userId/profile', authorisation, userController.updateUser)

// Product Api-----
router.post('/products', productController.createProduct);
router.get('/products', productController.getAllProducts)
router.get('/products/:productId', productController.getProduct)
router.put('/products/:productId', productController.updateProductData)
router.delete('/products/:productId', productController.deleteProduct)

//cart Api----
router.get('/users/:userId',cartController.getCart)
router.delete('/users/:userId',cartController.deleteCart)


module.exports = router;