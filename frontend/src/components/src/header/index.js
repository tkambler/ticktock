'use strict';

import app from 'app';
import './style.scss';

app.component('header', {
    'controller': function($log, $state, filterEnabled, $uibModal, Task) {

        const taskLinks = [];
        
        const links = [
            {
                'label': 'TickTock',
                'links': [
                    {
                        'label': 'Home',
                        'ui-sref': 'app.home'
                    },
                    {
                        'label': 'Tasks',
                        'links': taskLinks
                    }
                ]
            }
        ];

        return new class {

            $onInit() {
                
                this.links = links;
                
                return Task.getList()
                    .then((tasks) => {
                        
                        tasks = tasks.originalElements;
                        
                        tasks.forEach((task) => {
                            taskLinks.push({
                                'label': task.title,
                                'ui-sref': `app.task({ taskId: '${task.id}'})`
                            });
                        });
                        
                    });
                
            }

            showProfileModal() {
                
                return $uibModal.open({
                    'component': 'profileModal',
                    'scrollable': false
                });
                
            }

        };

    },
    'template': `
        <nav class="navbar navbar-inverse">
          <div class="container-fluid">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a ui-sref="app.home" class="navbar-brand"><i class="fa fa-home home-icon" aria-hidden="true"></i></a>
            </div>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              <ul class="nav navbar-nav">
                <li ng-repeat="link in $ctrl.links" ng-class="{ 'dropdown': link.links }">
                    <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label"></a>
                    <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label"></a>
                    <a ng-if="link.links" class="dropdown-toggle" data-toggle="dropdown" role="button"><span ng-bind-html="link.label"></span> <span class="caret"></span></a>
                    <ul ng-if="link.links" class="dropdown-menu">
                        <li ng-repeat="link in link.links" ng-class="{ 'dropdown': link.links, 'dropdown-submenu': link.links }">
                            <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label"></a>
                            <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label"></a>
                            <a ng-if="link.links" data-toggle="dropdown" ng-bind-html="link.label"></a>
                            <ul ng-if="link.links" class="dropdown-menu">
                              <li ng-repeat="link in link.links">
                                <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label"></a>
                                <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label"></a>
                              </li>
                            </ul>
                        </li>
                    </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
    `
});