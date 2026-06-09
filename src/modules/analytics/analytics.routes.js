const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const { getSummary, getClickLog } = require('./analytics.controller');

const router = express.Router();

router.use(authenticate);

router.get('/:shortCode', getSummary);
router.get('/:shortCode/clicks', getClickLog);

module.exports = router;