'use strict';

const parseCron = require('cron-parser').parseExpression;
const later = require('later');
const prettyjson = require('prettyjson');
const _ = require('lodash');
const WritableStream = require('app/writable-stream');
const { EventEmitter2 } = require('eventemitter2');
const delay = require('app/delay');
const rand = require('app/random-number');
const moment = require('moment-timezone');

function precisionRound(number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

class BaseTask extends EventEmitter2 {
    
    constructor(task, config, log) {
        
        super();
        
        this.task = _.cloneDeep(task);
        this.config = config;
        this.log = log;
                
        if (this.isCron) {
            this.parsed = later.parse.cron(task.interval);
        } else {
            this.parsed = later.parse.text(task.interval);
        }
        
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
    
    get zone() {
        
        if (!_.isUndefined(this._zone)) {
            return this._zone;
        }
        
        if (!this.config.get('timezone')) {
            return this._zone = null;
        }
        
        return this._zone = moment.tz.zone(this.config.get('timezone'));
        
    }
    
    get isCron() {
        
        if (!_.isUndefined(this._isCron)) {
            return this._isCron;
        }
        
        try {
            const cron = parseCron(this.task.interval);
            this._isCron = cron ? true : false;
        } catch(e) {
            this._isCron = false;
        }
        
        return this._isCron;
        
    }
    
    get randomDelay() {
        
        return this.task.random_delay;
        
    }
    
    get executionCount() {
        
        if (!_.isUndefined(this._executionCount)) {
            return this._executionCount;
        }
        
        this._executionCount = 0;
        
        return this._executionCount;
        
    }
    
    set executionCount(value) {
        
        return this._executionCount = value;
        
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
    
    getRandomDelay() {
        
        return rand(0, this.randomDelay);
        
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
    
    toJSON() {
        
        const data = _.cloneDeep(this.task);
        data.cron = this.isCron;
        data.last_execution = this.getLastExecution(true);
        data.next_execution = this.getNextExecution(true);
        
        return data;
        
    }
    
    print() {

        console.log(prettyjson.render(this));
        
    }
    
    execute() {
        
        if (this.executions.length > 1 && !this.task.overlap) {
            return;
        }
        
        this.emit('processing');
        
        const timeout = this.getRandomDelay();
        
        return delay(timeout)
            .then(() => {
                
                const execution = this.run();
                this.executions.push(execution);
                
                return execution
                    .then((res) => {
                        this.emit('processed', res);
                        this.processNotifications(res);
                    })
                    .finally(() => {
                        this.executionCount = this.executionCount + 1;
                        const idx = this.executions.indexOf(execution);
                        this.executions.splice(idx, 1);
                        if (this.executions.length === 0) {
                            this.emit('drain');
                        }
                    });
                
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
    
    getLastExecution(includeDiff) {
        
        if (!this.interval) {
            return '-';
        }
        
        const schedule = later.schedule(this.parsed);

        let prev = schedule.prev();
        
        if (includeDiff) {
            const now = moment();
            let diff = Math.abs(now.diff(moment(prev), 'seconds'));
            if (diff < 3600) {
                diff = Math.abs(precisionRound(moment(prev).diff(now, 'minutes', true), 1));
                prev += ` (${diff} minutes(s) ago)`;
            } else {
                diff = Math.abs(precisionRound(moment(prev).diff(now, 'hours', true), 1));
                prev += ` (${diff} hour(s) ago)`;
            }
        }
        
        return prev;
        
    }
    
    getNextExecution(includeDiff) {
        
        if (!this.interval) {
            return '-';
        }
        
        const schedule = later.schedule(this.parsed);

        let next = schedule.next();
        
        if (includeDiff) {
            const now = moment();
            let diff = moment(next).diff(now, 'seconds');
            if (diff < 3600) {
                diff = precisionRound(moment(next).diff(now, 'minutes', true), 1);
                next += ` (${diff} minutes(s) from now)`;
            } else {
                diff = precisionRound(moment(next).diff(now, 'hours', true), 1);
                next += ` (${diff} hour(s) from now)`;
            }
        }
        
        return next;
        
    }
    
}

module.exports = BaseTask;