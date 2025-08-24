const Joi = require('joi');

const createAddressSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  street: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
  type: Joi.string().valid('HOME', 'WORK', 'OTHER').default('HOME'),
  isDefault: Joi.boolean().default(false)
});

const updateAddressSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  street: Joi.string().min(5).max(200).optional(),
  city: Joi.string().min(2).max(50).optional(),
  state: Joi.string().min(2).max(50).optional(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).optional(),
  type: Joi.string().valid('HOME', 'WORK', 'OTHER').optional(),
  isDefault: Joi.boolean().optional()
});

module.exports = {
  createAddressSchema,
  updateAddressSchema
};
