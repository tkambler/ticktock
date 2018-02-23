'use strict';

const cron = require('node-cron');
const later = require('later');
const prettyjson = require('prettyjson');
const _ = require('lodash');
const WritableStream = require('app/writable-stream');
const { EventEmitter2 } = require('eventemitter2');
const md5 = require('md5');

class BaseTask extends EventEmitter2 {
    
    constructor(task) {
        
        super();
        
        this.task = _.cloneDeep(task);
        
        this.parsed = later.parse.text(task.interval);
        
        this.schedule();
        
    }
    
    get id() {
        
        return this._id ? this._id : this._id = md5(JSON.stringify(this.task));
        
    }
    
    get batchEmailInterval() {
        
        return this.task.batch_email_interval;
        
    }
    
    get pendingNotifications() {
        
        return this._pendingNotifications ? this._pendingNotifications : this._pendingNotifications = [];
        
    }
    
    get title() {
        
        return this.task.title;
        
    }
    
    get description() {
        
        return this.task.description;
        
    }
    
    get command() {
        
        return this.task.command;
        
    }
    
    get email() {
        
        return this.task.email;
        
    }
    
    get executions() {
        
        return this._executions ? this._executions : this._executions = [];
        
    }
    
    processNotifications(res) {
        
        if (this.batchEmailInterval === 0) {
            return this.emit('notify', res);
        }
        
        this.pendingNotifications.push(res);
        
        if (this.pendingNotifications.length === this.batchEmailInterval) {
            this.emit('notify', this.pendingNotifications);
            this.pendingNotifications.splice(0, this.pendingNotifications.length);
        }
        
    }
    
    print() {

        console.log(prettyjson.render({
            'Title': this.task.title,
            'Description': this.task.description,
            'Interval': this.task.interval,
            'Type': this.task.type,
            'Image': this.task.image,
            'Overlap': this.task.overlap,
            'Email': this.task.email,
            'Command': this.task.command.join(' ')
        }));
        
    }
    
    schedule() {
        
        this.interval = later.setInterval(() => {
            
            if (this.executions.length > 1 && !this.task.overlap) {
                return;
            }
            
            this.emit('processing');
            
            const execution = this.run();
            this.executions.push(execution);
            
            return execution
                .then((res) => {
                    this.emit('processed', res);
                    this.processNotifications(res);
                })
                .finally(() => {
                    const idx = this.executions.indexOf(execution);
                    this.executions.splice(idx, 1);
                });
            
        }, this.parsed);
        
    }
    
    stop() {
        
        this.stopped = true;
        
        if (this.interval) {
            this.interval.clear();
        }
        
    }
    
    start() {
        
        if (!this.stopped) {
            return;
        }
        
        this.stopped = false;
        this.schedule();
        
    }
    
}

module.exports = BaseTask;