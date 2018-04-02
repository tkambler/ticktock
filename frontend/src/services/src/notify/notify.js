'use strict';

import noty from 'noty';
import _ from 'lodash';
import $ from 'jquery';

module.exports = (message, type, options, $log) => {

    options = options || {};
    _.defaultsDeep(options, {
        'callbacks': {},
        'theme': 'relax',
        'animation': {
            'open': 'animated fadeIn',
            'close': 'animated fadeOut'
        }
    });
    const onShow = _.get(options.callbacks.onShow);
    const afterClose = _.get(options.callbacks.afterShow);
    options.callbacks.onShow = undefined;
    const id = _.uniqueId('notification_');

    if (options.link) {
        message += options.link.url ? `<br><a href="${options.link.url}" id="${id}">${options.link.label}</a>` : `<br><a id="${id}">${options.link.label}</a>`;
    }
    
    message = `<center>${message}</center>`;

    let _options = {
        'text': message,
        'layout': 'top',
        'type': type,
        'timeout': 4000
    };
    _.merge(_options, options);
    
    const n = new noty(_options);
    
    function clickFn() {
        if (_.get(options, 'link.fn')) {
            _.get(options, 'link.fn')();
        }
    }
    
    n.on('onShow', () => {
        if (options.link) {
            $(`#${id}`).on('click', clickFn);
        }
        if (onShow) {
            onShow();
        }
    });
    
    n.on('onClose', () => {
        if (options.link) {
            $(`#${id}`).off('click', clickFn);
        }
        if (afterClose) {
            afterClose();
        }
    });
    
    n.show();

};
