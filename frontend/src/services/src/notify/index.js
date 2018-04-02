'use strict';

import app from 'app';
import _ from 'lodash';

app.factory('notify', function($rootScope, parseError, $log) {

    let notify = require('./notify');

    return {
        'success': function(message, options) {
            let defaultMessage = _.isString(options) ? options : undefined;
            options = _.isObject(options) ? options : undefined;
            defaultMessage = _.get(options, 'default_message') ? _.get(options, 'default_message') : defaultMessage;
            notify(parseError(message, defaultMessage), 'success', options, $log);
        },
        'error': function(message, options) {
            let defaultMessage = _.isString(options) ? options : undefined;
            options = _.isObject(options) ? options : undefined;
            defaultMessage = _.get(options, 'default_message') ? _.get(options, 'default_message') : defaultMessage;
            notify(parseError(message, defaultMessage), 'error', options, $log);
        },
        'warn': function(message, options) {
            let defaultMessage = _.isString(options) ? options : undefined;
            options = _.isObject(options) ? options : undefined;
            defaultMessage = _.get(options, 'default_message') ? _.get(options, 'default_message') : defaultMessage;
            notify(parseError(message, defaultMessage), 'warn', options, $log);
        },
        'info': function(message, options) {
            let defaultMessage = _.isString(options) ? options : undefined;
            options = _.isObject(options) ? options : undefined;
            defaultMessage = _.get(options, 'default_message') ? _.get(options, 'default_message') : defaultMessage;
            notify(parseError(message, defaultMessage), 'info', options, $log);
        },
        'log': function(message, options) {
            let defaultMessage = _.isString(options) ? options : undefined;
            options = _.isObject(options) ? options : undefined;
            defaultMessage = _.get(options, 'default_message') ? _.get(options, 'default_message') : defaultMessage;
            notify(parseError(message, defaultMessage), 'log');
        }
    };

});
