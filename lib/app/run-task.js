'use strict';

const BaseTask = require('./base-task');
const Promise = require('bluebird');
const docker = require('services/docker');
const WritableStream = require('./writable-stream');
const moment = require('moment');

class RunTask extends BaseTask {
    
    run() {
        
        const outStream = new WritableStream();
        const errStream = new WritableStream();
        const start = moment();
        
        return new Promise((resolve, reject) => {
            
            return docker.run(this.task.image, this.task.command, [outStream, errStream], {
            
            }, (err, data, container) => {
                
                if (err) {
                    return reject(err);
                }
                
                return container.remove()
                    .then(() => {
                        return resolve({
                            'outputBuffer': outStream.output,
                            'errorBuffer': errStream.output,
                            'exitCode': data.StatusCode,
                            'start': start,
                            'end': moment()
                        });
                    })
                    .catch(reject);
            
            });
            
        });
        
    }
    
}

module.exports = RunTask;