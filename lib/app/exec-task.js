'use strict';

const BaseTask = require('./base-task');
const docker = require('services/docker');
const WritableStream = require('./writable-stream');
const moment = require('moment');

class ExecTask extends BaseTask {
    
    run() {
        
        let start;
        
        return docker.listContainers()
            .then((containers) => {
                return containers;
            })
            .filter((container) => {
                return container.Names.indexOf(this.task.container) >= 0 || container.Names.indexOf('/' + this.task.container) >= 0;
            })
            .then((containers) => {
                if (containers.length !== 1) {
                    console.log(`Error: Unable to locate container with name: ${this.task.container}`);
                }
                return docker.getContainer(containers[0].Id);
            })
            .then((container) => {
                return container.exec({
                    'Cmd': this.task.command,
                    'AttachStdout': true
                })
                    .then((exec) => {
                        const outStream = new WritableStream();
                        const errStream = new WritableStream();
                        return new Promise((resolve, reject) => {
                            start = moment();
                            return exec.start((err, stream) => {
                                if (err) {
                                    return reject(err);
                                }
                                container.modem.demuxStream(stream, outStream, errStream);
                                stream.on('end', resolve);
                            });
                        })
                            .then(() => {
                                return exec.inspect();
                            })
                            .then((res) => {
                                return {
                                    'outputBuffer': outStream.output,
                                    'errorBuffer': errStream.output,
                                    'exitCode': res.ExitCode,
                                    'start': start,
                                    'end': moment()
                                };
                            });
                    });
            });
        
    }
    
}

module.exports = ExecTask;