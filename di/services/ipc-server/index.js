'use strict';

exports = module.exports = function(taskManager) {

    const dnode = require('dnode');
    
    const server = dnode({
        'execute': (id, cb) => {
            taskManager.execute(id);
            return cb();
        },
        'getTasks': (cb) => {
            const tasks = taskManager.tasks.map((task) => {
                return task.task;
            });
            cb(null, tasks);
        }
    });

    server.listen(9090);
    
    return {};

};

exports['@singleton'] = true;
exports['@require'] = ['task-manager'];