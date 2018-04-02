'use strict';

exports = module.exports = function(config, docker, taskManager, ipcServer, api) {
    
    class Boot {
        
        constructor() {
            
            process.on('SIGTERM', () => {
                return taskManager.shutdown()
                    .then(() => {
                        process.exit(0);
                    });
            });
            
        }
        
    }
    
    return new Boot();

};

exports['@singleton'] = true;
exports['@require'] = ['config', 'docker', 'task-manager', 'ipc-server', 'api'];