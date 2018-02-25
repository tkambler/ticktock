'use strict';

exports = module.exports = function(config) {
    
    const Promise = require('bluebird');
    const nodemailer = require('nodemailer');
    const _ = require('lodash');
    const fs = require('app/fs');
        
    class Notifications {
        
        constructor() {
            
            config.on('change', () => {
                
                if (!config.get('email:smtp')) {
                    return;
                }
            
                this._emailTransport = Promise.promisifyAll(nodemailer.createTransport(config.get('email:smtp:config')));
                
            });
            
        }
        
        get emailTransport() {
            
            if (this._emailTransport) {
                return this._emailTransport;
            }
            
            if (!config.get('email:smtp')) {
                return;
            }
            
            this._emailTransport = Promise.promisifyAll(nodemailer.createTransport(config.get('email:smtp:config')));
            
            return this._emailTransport;
            
        }
        
        get customProviderPath() {
            
            return '/opt/ticktock/notifications/index.js';
            
        }
        
        getCustomProvider() {
            
            return Promise.resolve()
                .then(() => {
                    
                    if (!_.isUndefined(this.customProvider)) {
                        return this.customProvider;
                    }
                    
                    return fs.statAsync(this.customProviderPath)
                        .then(() => {
                            return this.customProvider = require(this.customProviderPath);
                        })
                        .catch(() => {
                            return this.customProvider = null;
                        });
                    
                });
            
        }
        
        custom(task, res) {
            
            return this.getCustomProvider()
                .then((provider) => {
                    if (!provider) {
                        return;
                    }
                    provider(task, res);
                    return null;
                });
            
        }
        
        email(task, res) {

            if (!this.emailTransport) {
                return;
            }
            
            task.email.forEach((email) => {
                
                const options = {
                    'from': `${config.get('email:smtp:from_name')} <${config.get('email:smtp:from_email')}>`,
                    'to': email
                };
                
                _.extend(options, this.generateEmail(task, res));
                
                this.emailTransport.sendMail(options);
                
            });
            
        }
        
        generateEmail(task, res) {
            
            const message = {};
            
            if (_.isArray(res)) { // res is an array of batched notification objects.
                
                const successCount = res.reduce((acc, curr) => {
                    if (curr.exitCode === 0) {
                        acc = acc + 1;
                    }
                    return acc;
                }, 0);
                
                const failureCount = res.reduce((acc, curr) => {
                    if (curr.exitCode !== 0) {
                        acc = acc + 1;
                    }
                    return acc;
                }, 0);
                
                message.subject = `Task ${task.title}: ${successCount} successful run(s), ${failureCount} failure(s)`;
                message.html = `Title: ${task.title}<br>Description: ${task.description}<br><br>`;
                message.text = `Title: ${task.title}\nDescription: ${task.description}\n\n`;
                
                res.forEach((res) => {
                    
                    message.html += `<hr><br><br>Start: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br>End: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br><br><pre>${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}</pre><br><br>`;
                    message.text += `--------------------\n\nStart: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\nEnd: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\n\n${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}\n\n`;
                    
                });
                
            } else { // res is a single notification object.
                
                if (res.exitCode === 0) {
                
                    message.subject = `Task Succeeded: ${task.title}`;
                    message.html = `Title: ${task.title}<br>Description: ${task.description}<br>Start: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br>End: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br><br><pre>${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}</pre>`;
                    message.text = `Title: ${task.title}\nDescription: ${task.description}\nStart: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\nEnd: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\n\n${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}`;
                
                } else {
                
                    message.subject = `Task Failed: ${task.title}`;
                    message.html = `Title: ${task.title}<br>Description: ${task.description}<br>Start: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br>End: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br><br><pre>${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}</pre>`;
                    message.text = `Title: ${task.title}\nDescription: ${task.description}\nStart: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\nEnd: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\n\n${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}`;
                
                }
                
            }
            
            return message;
            
        }
        
    }
    
    return new Notifications();

};

exports['@singleton'] = true;
exports['@require'] = ['config'];