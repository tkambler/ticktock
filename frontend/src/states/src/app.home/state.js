'use strict';

import './style.scss';
import moment from 'moment';
import Promise from 'bluebird';
import _ from 'lodash';

module.exports = {
    'name': 'app.home',
    'url': '/home?outputID&taskID',
    'resolve': {
        'tasks': function(Task) {
            
            return Task.getList();
            
        },
        'treeData': function(tasks, $log) {
            
            const res = [];
            
            tasks.forEach((task) => {
                res.push({
                    'id': task.id,
                    'parent': '#',
                    'text': task.title,
                    'state': {
                        'opened': true
                    }
                });
                task.dates.forEach((date) => {
                    res.push({
                        'id': `${task.id}--${date}`,
                        'parent': task.id,
                        'text': date
                    });
                });
            });
            
            return res;
            
        }
    },
    'views': {
        'content@app': {
            'controllerAs': '$ctrl',
            'controller': function($log, $state, filterEnabled, $uibModal, $http, notify, treeData, tasks, Output, $timeout, $stateParams) {
                
                return new class {
                    
                    treeData = treeData;
                    ignoreChanges = false;
                    
                    constructor() {
                        
                        this.onReady = this.onReady.bind(this);
                        this.onSelectNode = this.onSelectNode.bind(this);
                        
                    }
                    
                    $onInit() {
                        
                        if ($stateParams.outputID && $stateParams.taskID) {
                            this.loadTaskOutput($stateParams.outputID, $stateParams.taskID);
                        }
                        
                    }
                    
                    get shouldApply() {
                        
                        return !this.ignoreChanges;
                        
                    }
                    
                    get treeConfig() {
                        
                        return this._treeConfig ? this._treeConfig : this._treeConfig = {
                            'core': {
                                'multiple': false,
                                'animation': false,
                                'error': function(error) {
                                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                                },
                                'check_callback': true,
                                'worker': true
                            },
                            'types': {
                                'default': {
                                    'icon': 'glyphicon glyphicon-flash'
                                },
                                'star': {
                                    'icon': 'glyphicon glyphicon-star'
                                },
                                'cloud': {
                                    'icon': 'glyphicon glyphicon-cloud'
                                }
                            },
                            'plugins': ['types'],
                            'version': 1,
                        };
                        
                    }
                    
                    set treeInstance(value) {
                        
                        this._treeInstance = value;
                        
                    }
                    
                    get treeData() {
                        
                        return this._treeData;
                        
                    }
                    
                    set treeData(value) {
                        
                        return this._treeData = value;
                        
                    }
                    
                    onReady() {
                        
                        this.ignoreChanges = false;
                        
                    }
                    
                    onSelectNode(e, data) {
                        
                        if (_.isFinite(parseInt(data.node.id, 10))) {
                            const [ taskID, date ] = data.node.parent.split('--');
                            return this.loadTaskOutput(data.node.id, taskID);
                        }
                        
                        const [ taskID, date ] = data.node.id.split('--');
                        
                        if (!taskID || !date) {
                            return;
                        }
                        
                        return Promise.resolve(this.getTaskOutputs(taskID, date))
                            .map((output) => {
                                return output.originalElement;
                            })
                            .then((outputs) => {
                                this.setTaskOutputs(taskID, date, outputs);
                            });

                    }
                    
                    getTaskOutputs(taskID, date) {
                        
                        const task = _.find(tasks, {
                            'id': taskID
                        });
                        
                        return task.one('outputs', date).getList();
                        
                    }
                    
                    setTaskOutputs(taskID, date, outputs) {
                        
                        this.ignoreChanges = true;
                        
                        this._treeData = this._treeData.filter((row) => {
                            return row.parent !== `${taskID}--${date}`;
                        });
                        
                        this._treeData = this._treeData.map((row) => {
                            row.state = {
                                'opened': (row.id === taskID || row.id === `${taskID}--${date}`) ? true : false
                            };
                            return row;
                        });
                        
                        outputs.forEach((output) => {
                            this._treeData.push({
                                'id': output.id,
                                'parent': `${taskID}--${date}`,
                                'text': moment(output.start_ts).format('hh:mm:ss A')
                            });
                        });
                        
                        this.treeConfig.version++;
                        
                    }
                    
                    loadTaskOutput(id, taskID) {
                        
                        const task = _.find(tasks, {
                            'id': taskID
                        });
                        
                        return Output.one(id).get()
                            .then((output) => {
                                
                                const stateParams = _.cloneDeep($stateParams);
                                stateParams.outputID = id;
                                stateParams.taskID = taskID;
                                
                                $state.transitionTo($state.current.name, stateParams, {
                                    'notify': false
                                });
                                
                                this.output = output;
                                
                                $timeout(() => {
                                    this.databoxOptions = null;
                                }, 0);
                                
                                $timeout(() => {
                                    
                                    this.databoxOptions = {
                                        'heading': task.title,
                                        'sections': [
                                            {
                                                'label': `Overview`,
                                                'items': [
                                                    { 'label': 'Description', 'value': task.description, 'columns': 12 },
                                                    { 'label': 'Exit Code', 'value': output.exit_code },
                                                    { 'label': 'Start TS', 'value': moment(output.start_ts).format('dddd, MMMM Do YYYY, h:mm:ss A'), 'columns': 6, 'break': true },
                                                    { 'label': 'End TS', 'value': moment(output.end_ts).format('dddd, MMMM Do YYYY, h:mm:ss A'), 'columns': 6 }
                                                ]
                                            },
                                            {
                                                'label': 'Standard Output',
                                                'content': output.std_out || '-',
                                                'content_type': 'code'
                                            },
                                            {
                                                'label': 'Standard Error',
                                                'content': output.std_err || '-',
                                                'content_type': 'code'
                                            }
                                        ]
                                    };
                                    
                                }, 0);
                                
                            });
                        
                    }
                    
                }

            },
            'template': `
            
                <div class="state-container">
            
                    <div class="tree-nav noselect">
        
                        <div js-tree="$ctrl.treeConfig" should-apply="$ctrl.shouldApply" ng-model="$ctrl.treeData" tree="$ctrl.treeInstance" tree-events="ready:$ctrl.onReady;select_node:$ctrl.onSelectNode"></div>
                    
                    </div>
        
                    <div class="databox-container" ng-if="$ctrl.databoxOptions">
        
                        <databox options="$ctrl.databoxOptions"></databox>
        
                    </div>
            
                </div>
            
            `
        }
    }
};