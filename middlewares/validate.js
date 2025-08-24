const ApiResponse = require('../utils/ApiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        const key = detail.path.join('.');
        errors[key] = detail.message;
      });
      
      return ApiResponse.error(res, 'Validation failed', 400, errors);
    }
    
    next();
  };
};

module.exports = { validate };
