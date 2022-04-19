const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController')
const { authorisation } = require('../middleware/authorization');


// User Api----
router.post('/register', userController.registerUser);
router.post('/login', userController.userLogin);
router.get('/user/:userId', authorisation, userController.getUser);
router.put('/user/:userId/profile', authorisation, userController.updateProfile);

// Product Api-----
router.post('/products', productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/:productId', productController.getProduct);
router.put('/products/:productId', productController.updateProductData);
router.delete('/products/:productId', productController.deleteProduct);

// Cart Api--
router.post('/users/:userId/cart', authorisation, cartController.addToCart);
router.put('/users/:userId/cart', authorisation, cartController.removeProductFromCart);
router.get('/users/:userId/cart', authorisation, cartController.getCart);
router.delete('/users/:userId/cart', authorisation, cartController.deleteCart);

// Order Api--
router.post('/users/:userId/orders', authorisation, orderController.createOrder);
router.put('/users/:userId/orders', authorisation, orderController.upadateOrder);

module.exports = router;