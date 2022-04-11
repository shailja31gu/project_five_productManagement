const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorisation } = require('../middleware/authorization');


router.post('/register', userController.registerUser);
router.post('/login', userController.userLogin);
router.get('/user/:userId',authorisation, userController.getUser)


module.exports = router;