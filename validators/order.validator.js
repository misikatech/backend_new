const Joi = require('joi');

const checkoutSchema = Joi.object({
  addressId: Joi.string().required(),
  paymentMethod: Joi.string().valid('COD', 'STRIPE', 'UPI', 'NET_BANKING').required(),
  notes: Joi.string().max(500).optional()
});

const createOrderSchema = Joi.object({
  addressId: Joi.string().required(),
  paymentMethod: Joi.string().valid('COD', 'STRIPE', 'UPI', 'NET_BANKING').required(),
  paymentIntentId: Joi.string().optional(),
  notes: Joi.string().max(500).optional()
});

module.exports = {
  checkoutSchema,
  createOrderSchema
};
