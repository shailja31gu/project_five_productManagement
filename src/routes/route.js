const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController')
const { authorisation } = require('../middleware/authorization');



router.post('/register', userController.registerUser);
router.post('/login', userController.userLogin);
router.get('/user/:userId',authorisation, userController.getUser)
router.put('/user/:userId',authorisation,userController.updateUser)

router.post('/products', productController.createProduct);
router.get('/products/:productId',productController.getproductList)
// router.put('/products/:productId',productController.updateProduct)


module.exports = router;