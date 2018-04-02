'use strict';

import app from 'app';
import _ from 'lodash';

app.factory('filterEnabled', function() {
    
    return (items) => {
        return items.filter((item) => {
            if (_.isBoolean(item.enabled)) {
                return item.enabled;
            } else if (_.isFunction(item.enabled)) {
                return item.enabled();
            } else {
                return true;
            }
        });
    };
    
});