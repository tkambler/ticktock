'use strict';

import app from 'app';
import _ from 'lodash';

app.factory('parseError', function() {

    return (message, defaultMessage = 'Unknown Error') => {
        if (_.isString(message)) return message;
        if (_.get(message, 'data.error')) return message.data.error;
        if (_.get(message, 'message')) return message.message;
        return defaultMessage;
    };

});