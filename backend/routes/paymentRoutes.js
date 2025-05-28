const express = require('express');
const { makeGroupPayment } = require('../controllers/paymentController');
const router = express.Router();

router.post('/start', makeGroupPayment);

module.exports = router;