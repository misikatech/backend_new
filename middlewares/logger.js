const morgan = require('morgan');

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token for request ID (if you want to add request tracking)
morgan.token('req-id', (req) => {
  return req.id || 'no-id';
});

// Development format
const developmentFormat = ':method :url :status :res[content-length] - :response-time ms - User: :user-id';

// Production format (more detailed)
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms - User: :user-id';

// Create logger based on environment
const logger = process.env.NODE_ENV === 'production' 
  ? morgan(productionFormat)
  : morgan(developmentFormat);

module.exports = logger;
