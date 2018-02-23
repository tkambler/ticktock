'use strict';

exports = module.exports = function() {
    
    const Docker = require('dockerode');
    
    const docker = new Docker({
        'socketPath': '/var/run/docker.sock',
        'Promise': require('bluebird')
    });
    
    return docker;

};

exports['@singleton'] = true;
exports['@require'] = [];