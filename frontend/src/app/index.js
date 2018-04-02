'use strict';

import angular from 'angular';

const app = angular.module('app', [
    'ngSanitize',
    'restangular',
    'ui.bootstrap',
    'ui.router',
    'validation.match',
    'angular-loading-bar',
    'angular-json-tree',
    'ngJsTree',
]);

export default app;

import config from './config';

app.constant('config', config);