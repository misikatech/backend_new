const ApiResponse = require('../utils/response');

const notFound = (req, res, next) => {
  ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = notFound;
