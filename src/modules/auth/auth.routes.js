const express = require('express');
const { validateRegister, validateLogin } = require('./auth.validation');
const { register, login } = require('./auth.controller');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

module.exports = router;