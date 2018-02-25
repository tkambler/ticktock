'use strict';

const Promise = require('bluebird');

module.exports = (seconds) => {
    
    return new Promise((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
    });
    
};