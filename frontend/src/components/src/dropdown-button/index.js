'use strict';

import app from 'app';

app.component('dropdownButton', {
    'bindings': {
        'options': '<'
    },
    'controller': function() {

        return new class {

            $onInit() {

            }

            get klass() {
                switch (_.get(this, 'options.size')) {
                    case 'small':
                        return 'btn-sm';
                    default:
                        return '';
                }
            }

            get label() {
                return _.get(this, 'options.label');
            }

            get icon() {
                return _.get(this, 'options.icon');
            }

        };

    },
    'template': `
        <button class="btn btn-default dropdown-toggle" ng-disabled="$ctrl.options.links.length === 0" ng-class="$ctrl.klass" data-toggle="dropdown" ng-if="$ctrl.label"><span ng-bind="$ctrl.label" ng-show="$ctrl.label"></span><span ng-show="$ctrl.label"> </span><span class="caret" ng-show="$ctrl.label"></span></button>
        <span ng-class="$ctrl.icon" class="dropdown-toggle dropdown-toggle-icon" data-toggle="dropdown" ng-if="$ctrl.icon"></span>
        <ul class="dropdown-menu dropdown-menu-right">
            <li ng-repeat="link in $ctrl.options.links" ng-class="{ 'dropdown': link.links, 'dropdown-submenu': link.links, 'divider': link.divider }">
                <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label" ng-class="link.klass"></a>
                <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label" ng-class="link.klass"></a>
                <a ng-if="link.links" data-toggle="dropdown" ng-bind-html="link.label" ng-class="link.klass"></a>
                <ul ng-if="link.links" class="dropdown-menu scrollable-menu">
                  <li ng-repeat="link in link.links">
                    <a ng-if="link.fn" ng-click="link.fn()" ng-bind-html="link.label" ng-class="link.klass"></a>
                    <a ng-if="link['ui-sref']" ng-attr-ui-sref="{{link['ui-sref']}}" ng-bind-html="link.label" ng-class="link.klass"></a>
                  </li>
                </ul>
            </li>
        </ul>
    `
});