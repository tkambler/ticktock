'use strict';

exports = module.exports = function(log, config, appDir, knex, taskManager) {

    const Promise = require('bluebird');    
    const express = require('express');
    const app = Promise.promisifyAll(express());
    const moment = require('moment');
    const path = require('path');
    const auth = require('basic-auth');
    const _ = require('lodash');
    const port = 80;
    
    app.use(require('body-parser').json({
        'limit': '50mb'
    }));
    
    function adminAuth(req, res, next) {
        
        if (!config.get('admin:username') || !config.get('admin:password')) {
            
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="example"');
            res.end('Access denied');
            
        } else {
            
            const { name, pass } = auth(req) || {};
        
            if (name !== config.get('admin:username') || pass !== config.get('admin:password')) {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="example"');
                res.end('Access denied');
            } else {
                return next();
            }
            
        }
        
    }
    
    app.param('task_id', (req, res, next, id) => {
       
        const task = _.find(config.get('tasks'), {
            'id': id
        });
        
        if (task) {
            req.task = task;
            return next();
        } else {
            const err = new Error(`Task not found: ${id}`);
            err.http_code = 404;
            return next(err);
        }
        
    });
    
    app.param('output_id', (req, res, next, id) => {
        
        return knex('outputs')
            .first('*')
            .where('id', id)
            .then((output) => {
                if (!output) {
                    const err = new Error(`Output not found: ${id}`);
                    err.http_code = 404;
                    return next(err);
                }
                req.output = output;
                next();
                return null;
            })
            .catch((e) => {
                const err = new Error(`Output not found: ${id}`);
                err.http_code = 404;
                return next(err);
            });
        
    });
    
    app.use('/', adminAuth);
    app.use('/', express.static(path.resolve(appDir, 'frontend/public')));
    
    app.route('/api/tasks')
        .get((req, res, next) => {
            
            const tasks = config.get('tasks');
            
            return knex('outputs')
                .distinct('task_id', 'date')
                .then((rows) => {
                    return rows;
                })
                .map((row) => {
                    row.date = moment(row.date, 'MM-DD-YYYY');
                    return row;
                })
                .then((rows) => {
                    
                    rows = _.groupBy(rows, 'task_id');
                    
                    const result = [];
                    
                    _.each(rows, (outputs, taskID) => {
                        
                        const task = _.cloneDeep(_.find(tasks, {
                            'id': taskID
                        }));
                        
                        if (!task) {
                            return;
                        }
                        
                        outputs.sort((a, b) => {
                            if (a.date.isBefore(b.date)) {
                                return -1;
                            } else if (a.date.isAfter(b.date)) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        
                        task.dates = outputs.map((output) => {
                            return output.date.format('MM-DD-YYYY');
                        });
                        
                        result.push(task);
                        
                    });
                    
                    return res.send(result);
                    
                })
                .catch(next);
            
        });
        
    app.route('/api/tasks/:task_id')
        .get((req, res, next) => {
            
            return res.send(req.task);
            
        });
        
    app.route('/api/tasks/:task_id/trigger')
        .put((req, res, next) => {
            
            taskManager.execute(req.task.id);
            
            return res.status(200).end();
            
        });
        
    app.route('/api/tasks/:task_id/outputs/:date')
        .get((req, res, next) => {
            
            return knex('outputs')
                .select('*')
                .where({
                    'task_id': req.task.id,
                    'date': req.params.date
                })
                .then((outputs) => {
                    
                    outputs = outputs.map((output) => {
                        output.startMoment = moment(output.start_ts);
                        return output;
                    });

                    outputs.sort((a, b) => {
                        if (a.startMoment.isBefore(b.startMoment)) {
                            return -1;
                        } else if (a.startMoment.isAfter(b.startMoment)) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    
                    return outputs.map((output) => {
                        delete output.startMoment;
                        return output;
                    });

                })
                .then(res.send.bind(res))
                .catch(next);
            
        });
        
    app.route('/api/outputs/:output_id')
        .get((req, res, next) => {
            
            return res.send(req.output);
            
        });
            
    return app.listenAsync(port)
        .tap(() => {
            log.info(`API is listening on port: ${port}`);
        });

};

exports['@singleton'] = true;
exports['@require'] = ['log', 'config', 'appDir', 'knex', 'task-manager'];