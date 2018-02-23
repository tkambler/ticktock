'use strict';

exports = module.exports = function(config, docker, taskManager) {
    
    class Boot {
        
    }
    
    return new Boot();

};

exports['@singleton'] = true;
exports['@require'] = ['config', 'docker', 'task-manager'];