'use strict';

import app from 'app';
import _ from 'lodash';
import angular from 'angular';

app.config(function(RestangularProvider, config) {

    RestangularProvider.setBaseUrl(config.base_api_url);
    RestangularProvider.setDefaultHttpFields({
        'withCredentials': true
    });

    RestangularProvider.setResponseExtractor((response) => {
        if (!response || !_.isObject(response)) return response;
        let newResponse = response;
        if (angular.isArray(response)) {
            newResponse.originalElements = [];
            angular.forEach(newResponse, (value, key) => {
                if (_.isString(newResponse[key])) {
                    return;
                }
                newResponse[key].originalElement = angular.copy(value);
                newResponse.originalElements.push(newResponse[key].originalElement);
            });
        } else {
            newResponse.originalElement = angular.copy(response);
        }
        return newResponse;
    });
    
    RestangularProvider.setRestangularFields({
        'selfLink': 'self.link'
    });

});