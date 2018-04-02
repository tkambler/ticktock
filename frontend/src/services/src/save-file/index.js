'use strict';
/* global Blob */

import app from 'app';
import FileSaver from 'file-saver';
import _ from 'lodash';

app.factory('saveFile', function($log) {

    return (filename, data, options) => {

        data = typeof data === 'string' ? data : JSON.stringify(data, null, 4);
        options = options || {};
        _.defaults(options, {
            'type': 'text/plain;charset=utf-8'
        });

        let blob = new Blob([data], {
            'type': options.type
        });

        FileSaver.saveAs(blob, filename);

    };

});