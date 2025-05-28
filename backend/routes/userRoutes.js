const express = require('express');
const { createUser, verifyUser, fetchWalletBalance } = require('../controllers/userController');
const {authMiddleware} = require('../middleware/authmiddleware');
const router = express.Router();

router.post('/signup', createUser);
router.post('/login', verifyUser);
router.get('/wallet', authMiddleware, fetchWalletBalance)

module.exports = router;