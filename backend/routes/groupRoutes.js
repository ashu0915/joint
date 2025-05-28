const express = require('express');
const { createGroup, fetchGroups } = require('../controllers/groupController');
const {authMiddleware} = require('../middleware/authmiddleware');
const router = express.Router();

router.post('/create',authMiddleware, createGroup);
router.get('/mygroup', authMiddleware,fetchGroups);

module.exports = router;
