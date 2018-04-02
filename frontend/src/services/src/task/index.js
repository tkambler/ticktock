'use strict';

import app from 'app';
import _ from 'lodash';

app.factory('Task', function(Restangular) {

    Restangular = Restangular.withConfig(function(RestangularConfigurer) {
    });
    
    Restangular.extendModel('tasks', function(model) {
        return model;
    });

    return Restangular.service('tasks');
    
});