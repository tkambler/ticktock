'use strict';

exports = module.exports = function(config, docker, notifications) {
    
    const { ExecTask, RunTask } = require('app/tasks');
    const _ = require('lodash');
    const prettyjson = require('prettyjson');
    
    class TaskManager {
        
        constructor() {
            
            config.get('tasks').forEach(this.loadTask.bind(this));
            
            if (this.tasks.length === 0) {
                console.log('No tasks were registered.');
            }
            
            config.on('change', this.onConfigChange.bind(this));
            
        }
        
        get tasks() {
            
            return this._tasks ? this._tasks : this._tasks = [];
            
        }
        
        loadTask(taskObj) {

            const task = this.forgeTask(taskObj);
            
            task.on('processing', () => {
                
                console.log('Processing task:');
                console.log('');
                task.print();
                console.log('');
                
            });
            
            task.on('processed', (res) => {
                
                console.log('Task completed:');
                console.log('');
                console.log('Exit Code: ' + res.exitCode);
                console.log('');
                console.log(res.outputBuffer.toString('utf8'));
                console.log('');

            });
            
            task.on('notify', (res) => {
                
                if (task.email) {
                    notifications.email(task, res);
                }
                
            });
            
            this.tasks.push(task);
            
            console.log('Registered task:')
            console.log('');
            task.print();
            console.log('');

        }
        
        forgeTask(task) {
            
            switch (task.type) {
                case 'exec':
                    return new ExecTask(task);
                case 'run':
                    return new RunTask(task);
                default:
                    const err = new Error();
                    err.code = 'INVALID_TASK_TYPE';
                    err.task = task;
                    throw err;
            }
            
        }
        
        onConfigChange() {
            
            console.log('Configuration file has been updated.');
            
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
            
            console.log(`${tasks.length} discarded task(s) found:`);
        
            tasks.forEach((task) => {
                
                console.log('');
                task.print();
                console.log('');
                
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
        
    }
    
    return new TaskManager();

};

exports['@singleton'] = true;
exports['@require'] = ['config', 'docker', 'notifications'];