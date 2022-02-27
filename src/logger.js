const logger = require('./winston.js');


module.exports = {
  logInfo(message) {
    logger.info(message);
  },
  logError(message) {
    logger.error(message);
  },
};