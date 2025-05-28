const express = require('express');
const { deposit } = require('../controllers/depositController');
const router = express.Router();

router.post('/', deposit);

module.exports = router;