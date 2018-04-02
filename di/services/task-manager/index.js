'use strict';

exports = module.exports = function(config, docker, notifications, log, knex) {
    
    const { ExecTask, RunTask } = require('app/tasks');
    const _ = require('lodash');
    const prettyjson = require('prettyjson');
    
    class TaskManager {
        
        constructor() {
            
            config.get('tasks').forEach(this.loadTask.bind(this));
            
            if (this.tasks.length === 0) {
                log.info('No tasks were registered.');
            }
            
        }
        
        get tasks() {
            
            return this._tasks ? this._tasks : this._tasks = [];
            
        }
        
        loadTask(taskObj) {

            const task = this.forgeTask(taskObj);
            
            task.on('processing', () => {
                
                log.info('Processing task.', {
                    'task': task.toJSON()
                });
                
            });
            
            task.on('processed', (res) => {
                
                log.info('Task completed.', {
                    'task': task.toJSON(),
                    'output': res.outputBuffer.toString('utf8')
                });
                
                knex('outputs').insert({
                    'task_id': task.id,
                    'std_out': res.outputBuffer.toString('utf8'),
                    'std_err': res.errorBuffer.toString('utf8'),
                    'start_ts': res.start.format(),
                    'end_ts': res.end.format(),
                    'date': res.start.format('MM-DD-YYYY'),
                    'exit_code': res.exitCode
                })
                    .catch((err) => {
                        log.error(err);
                    });

            });
            
            task.on('notify', (res) => {
                
                if (task.email) {
                    notifications.email(task, res);
                }
                
                notifications.custom(task, res);
                
            });
            
            this.tasks.push(task);
            
            log.info('Registered task.', {
                'task': task.toJSON()
            });

        }
        
        forgeTask(task) {
            
            switch (task.type) {
                case 'exec':
                    return new ExecTask(task, config, log, knex);
                case 'run':
                    return new RunTask(task, config, log, knex);
                default:
                    const err = new Error();
                    err.code = 'INVALID_TASK_TYPE';
                    err.task = task;
                    throw err;
            }
            
        }
        
        onConfigChange() {
            
            log.info('Configuration file has been updated.');
            
            const orphans = [];
            
            this.tasks.forEach((task) => {
                
                const taskObj = _.find(config.get('tasks'), (taskObj) => {
                    return taskObj.id === task.id;
                });
                
                if (!taskObj) {
                    orphans.push(task);
                }
                
            });
            
            this.processOrphans(orphans);
            
            config.get('tasks').forEach((taskObj) => {
            
                let task = this.getTaskByID(taskObj.id);
                
                if (task) {
                    return;
                }
                
                this.loadTask(taskObj);
            
            });
            
        }
        
        getTaskByID(id) {
            
            return _.find(this.tasks, (task) => {
                return task.id === id;
            });
            
        }
        
        processOrphans(tasks) {
            
            if (tasks.length === 0) {
                return;
            }
            
            log.info(`${tasks.length} discarded task(s) found.`);
        
            tasks.forEach((task) => {
                
                log.info('Discarding task.', {
                    'task': task.toJSON()
                });
                
                this.removeTask(task);
                
            });
            
        }
        
        removeTask(task) {
            
            const idx = this.tasks.indexOf(task);
            this.tasks.splice(idx, 1);
            task.stop();
            
        }
        
        shutdown() {
            
            return new Promise((resolve, reject) => {
                
                const running = [];
                
                this.tasks.forEach((task) => {
                    task.stop();
                    if (task.isRunning()) {
                        running.push(task);
                        task.once('drain', () => {
                            running.splice(running.indexOf(task), 1);
                            if (running.length === 0) {
                                return resolve();
                            }
                        });
                    }
                });
                
            });
            
        }
        
        execute(id) {
            
            const task = this.getTaskByID(id);
            
            if (!task) {
                throw new Error(`Unable to locate task with ID: ${id}`);
            }
            
            task.execute();
            
        }
        
        printStatus() {
            
            const data = this.tasks.map((task) => {
                
                return {
                    'Title': task.title,
                    'Description': task.description,
                    'Total Executions': task.executionCount,
                    'Last Execution': task.getLastExecution(),
                    'Next Execution': task.getNextExecution()
                }
                
            });
            
            console.log(prettyjson.render(data));
            
        }
        
    }
    
    return new TaskManager();

};

exports['@singleton'] = true;
exports['@require'] = ['config', 'docker', 'notifications', 'log', 'knex'];