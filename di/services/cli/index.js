'use strict';

exports = module.exports = function(config, knex, docker) {
    
    return {};

};

exports['@singleton'] = true;
exports['@require'] = ['config', 'knex', 'docker'];