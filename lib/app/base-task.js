'use strict';

const cron = require('node-cron');
const later = require('later');
const prettyjson = require('prettyjson');
const _ = require('lodash');
const WritableStream = require('app/writable-stream');
const { EventEmitter2 } = require('eventemitter2');

class BaseTask extends EventEmitter2 {
    
    constructor(task) {
        
        super();
        
        this.task = _.cloneDeep(task);
        
        this.parsed = later.parse.text(task.interval);
        
        if (this.parsed.error >= 0) {
            const err = new Error();
            err.code = 'INTERVAL_PARSE_ERROR';
            err.character_position = this.parsed.error;
            err.task = task;
            throw err;
        }
        
        this.schedule();
        
        if (this.executeOnStart) {
            this.execute();
        }
        
    }
    
    get id() {
        
        return this.task.id;
        
    }
    
    get executeOnStart() {
        
        return this.task.execute_on_start;
        
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

        console.log(prettyjson.render(this.task));
        
    }
    
    execute() {
        
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
                if (this.executions.length === 0) {
                    this.emit('drain');
                }
            });

    }
    
    schedule() {
        
        this.interval = later.setInterval(this.execute.bind(this), this.parsed);
        
    }
    
    isRunning() {
        
        return this.executions.length > 0;
        
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