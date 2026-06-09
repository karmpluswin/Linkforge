const Joi = require('joi');

const options = {
  abortEarly: false,
  stripUnknown: true,
};

const registerSchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
};