const winston = require('winston'),
    format = winston.format;

const transformer = format((info) => {
    if (info.meta && info.meta instanceof Error) {
        info.meta = {
            message: info.meta.message,
            stack: info.meta.stack
        };
    }
    return info;
})();
const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.splat(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss,SS'
        }),
        transformer,
        format.json()
    ),
    transports: [ new winston.transports.Console({
        level: 'info',
        handleExceptions: true,
        silent: false
    }) ],
});

module.exports = logger;
