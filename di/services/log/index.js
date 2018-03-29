'use strict';

exports = module.exports = function(config) {
    
    const winston = require('winston');
    const logger = new winston.Logger();
    
    logger.setLevels({
        'error': 0,
        'warn': 1,
        'info': 2,
        'debug': 3,
        'trace': 4
    });
    
    logger.add(winston.transports.Console, {
        'json': true,
        'timestamp': true,
        'stringify': true,
        'prettyPrint': true
    });
    
    logger.stream = {
        'write': (msg, enc) => {}
    };
    
    logger.setLevel = (level) => {
        logger.transports.console.level = level;
    };
    
    if (config.get('env:development')) {
        logger.setLevel('debug');
    }
    
    return logger;

};

exports['@singleton'] = true;
exports['@require'] = ['config'];