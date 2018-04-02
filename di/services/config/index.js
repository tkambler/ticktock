'use strict';

exports = module.exports = function(appDir) {
    
    const Promise = require('bluebird');
    const handlers = require('shortstop-handlers');
    const concatHandler = require('shortstop-concat');
    const { EventEmitter2 } = require('eventemitter2');
    const fs = require('app/fs');
    const _ = require('lodash');
    const yaml = require('js-yaml');
    const uuid = require('uuid');
    let config;
    
    const confit = Promise.promisifyAll(require('confit')({
        'basedir': appDir,
        'protocols': {
            'require': handlers.require(appDir),
            'path': handlers.path(appDir),
            'glob': handlers.glob(appDir),
            'env': handlers.env(),
            'concat': concatHandler(appDir, {
                'require': handlers.require(appDir),
                'path': handlers.path(appDir)
            })
        }
    }));
    
    const initConfig = (config) => {
        
        const tasks = config.get('tasks');
        
        tasks.forEach((task, k) => {

            _.defaults(task, {
                'overlap': false,
                'enabled': true,
                'execute_on_start': false,
                'email': [],
                'random_delay': 0
            });

            if (!task.id) {
                throw new Error(`task.id is required.`);
            }
            
            const idTasks = _.filter(tasks, {
                'id': task.id
            });
            
            if (idTasks.length > 1) {
                throw new Error(`More than one task has been assigned the following ID: ${task.id}`);
            }

            task.batch_email_interval = parseInt(task.batch_email_interval, 10);
            task.batch_email_interval = task.batch_email_interval || 0;
            task.random_delay = parseInt(task.random_delay, 10);
            task.random_delay = task.random_delay || 0;
            
            if (task.email && !_.isArray(task.email)) {
                task.email = task.email.split(',')
                    .map((email) => {
                        return email.trim();
                    });
            }
            
            config.set('tasks', config.get('tasks').filter((task) => {
                return task.enabled;
            }));

        });
        
    };

    fs.watchFile('/config.yml', () => {
        return fs.readFileAsync('/config.yml', 'utf8')
            .then(yaml.safeLoad.bind(yaml))
            .then((src) => {
                config.use(src);
                initConfig(config);
                config.emit('change');
            });
    });
    
    const emitter = new EventEmitter2();
    
    return Promise.props({
        '_config': (() => {
            return confit.createAsync();
        })(),
        'src': (() => {
            return fs.readFileAsync('/config.yml', 'utf8')
                .then(yaml.safeLoad.bind(yaml));
        })()
    })
        .then(({ _config, src }) => {
            
            config = _config;
            
            config.on = emitter.on.bind(emitter);
            config.emit = emitter.emit.bind(emitter);
            
            config.use(src);
            
            initConfig(config);
            
            return config;
            
        });

};

exports['@singleton'] = true;
exports['@require'] = ['appDir'];