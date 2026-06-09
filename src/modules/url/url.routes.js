const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const { validateCreateUrl, validateUpdateUrl } = require('./url.validation');
const { createUrl, getMyUrls, getUrlById, updateUrl, deleteUrl } = require('./url.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', validateCreateUrl, createUrl);
router.get('/', getMyUrls);
router.get('/:id', getUrlById);
router.patch('/:id', validateUpdateUrl, updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;