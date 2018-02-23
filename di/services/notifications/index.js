'use strict';

exports = module.exports = function(config) {
    
    const Promise = require('bluebird');
    const nodemailer = require('nodemailer');
    const _ = require('lodash');
        
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
        
        email(task, res) {
            
            // console.log('email', task, res);
            
            // const mailOptions = {
            //     'from': msg.from.value,
            //     'to': msg.to.value,
            //     'subject': msg.subject,
            //     'text': msg.text,
            //     'html': msg.textAsHtml,
            // };
            
            if (!this.emailTransport) {
                return;
            }
            
            task.email.forEach((email) => {
                
                const options = {
                    'from': `${config.get('email:smtp:from_name')} <${config.get('email:smtp:from_email')}>`,
                    'to': email,
                    // 'subject': 'Test',
                    // 'text': 'Text',
                    // 'html': 'HTML'
                };
                
                _.extend(options, this.generateEmail(task, res));
                
                this.emailTransport.sendMail(options);
                
            });
            
        }
        
        generateEmail(task, res) {
            
            // console.log(task, res);
            
            const message = {};
            
            if (res.exitCode === 0) {
                
                message.subject = `Task Succeeded: ${task.title}`;
                message.html = `Title: ${task.title}<br>Description: ${task.description}<br>Start: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br>End: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br><br><pre>${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}</pre>`;
                message.text = `Title: ${task.title}\nDescription: ${task.description}\nStart: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\nEnd: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\n\n${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}`;
                
            } else {
                
                message.subject = `Task Failed: ${task.title}`;
                message.html = `Title: ${task.title}<br>Description: ${task.description}<br>Start: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br>End: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}<br><br><pre>${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}</pre>`;
                message.text = `Title: ${task.title}\nDescription: ${task.description}\nStart: ${res.start.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\nEnd: ${res.end.format('dddd, MMMM Do YYYY, h:mm:ss a Z')}\n\n${res.outputBuffer.toString('utf8')}\n\n-----\n\n${res.errorBuffer.toString('utf8')}`;
                
            }
            
            return message;
            
        }
        
    }
    
    return new Notifications();

};

exports['@singleton'] = true;
exports['@require'] = ['config'];