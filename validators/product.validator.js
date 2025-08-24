const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().required(),
  salePrice: Joi.number().positive().optional(),
  sku: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  categoryId: Joi.string().uuid().required(),
  isFeatured: Joi.boolean().optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().min(10).optional(),
  price: Joi.number().positive().optional(),
  salePrice: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  categoryId: Joi.string().uuid().optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional()
});

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),
  image: Joi.string().uri().optional()
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  createCategorySchema
};