const { createLogger, format, transports } = require('winston');


const logger = createLogger({
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.simple(),
        format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`),
      ),
    }),
    new transports.File({
      filename: './log/combined.log',
      level: 'debug',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.json(),
      ),
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: './log/exceptions.log' }),
  ],
});

module.exports = logger;