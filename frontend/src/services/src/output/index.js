'use strict';

import app from 'app';
import _ from 'lodash';

app.factory('Output', function(Restangular) {

    Restangular = Restangular.withConfig(function(RestangularConfigurer) {
    });
    
    Restangular.extendModel('outputs', function(model) {
        return model;
    });

    return Restangular.service('outputs');
    
});