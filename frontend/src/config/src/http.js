'use strict';

import app from 'app';

app.config(function($httpProvider, config) {

    $httpProvider.defaults.withCredentials = true;

    /* Prepend all outbound requests to URLs containing `api` with the appropriate hostname. */
    $httpProvider.interceptors.push(function () {
        return {
            'request': function(c) {
                if (c.url.indexOf('/api/') === 0) {
                    c.url = `${config.base_api_protocol}://${config.base_api_host}${c.url}`;
                }
                return c;
            }
        };
    });

});