'use strict';

module.exports = {
    'name': 'app',
    'resolve': {
    },
    'views': {
        '': {
            'controllerAs': '$ctrl',
            'controller': function($log, $rootScope, $scope, $state) {
                
                return new class {
                    
                };
                
            },
            'template': `
                <header></header>
                <ui-view name="content" class="content container-fluid" ng-class="stateClass"></ui-view>
            `
        }
    }
};