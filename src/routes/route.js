const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const middleware = require('../middleware/authorization');

router.post('/register', userController.registerUser);
router.post('/login', userController.userLogin);
router.get('/user/:userId', middleware.authentication,middleware.authorisation, userController.getUser)
router.put('/user/:userId',userController.updateUserDetalis)

module.exports = router;