const Joi = require('joi');

const options = {
  abortEarly: false,
  stripUnknown: true,
};

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

const createUrlSchema = Joi.object({
  originalUrl: Joi.string().uri().required(),
  customAlias: Joi.string().alphanum().min(3).max(30).optional(),
  expiresAt: Joi.date().greater('now').optional(),
});

const updateUrlSchema = Joi.object({
  customAlias: Joi.string().alphanum().min(3).max(30).optional(),
  expiresAt: Joi.date().greater('now').optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  validateCreateUrl: validate(createUrlSchema),
  validateUpdateUrl: validate(updateUrlSchema),
};