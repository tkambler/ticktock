'use strict';

import app from 'app';
import _ from 'lodash';
import states from 'states';

app.config(function($stateProvider, $urlRouterProvider) {

    _.each(states, (state, name) => {
        _.defaults(state, {
            'reloadOnSearch': false,
            'resolve': {}
        });
        return $stateProvider.state(state);
    });

    $urlRouterProvider.otherwise('/home');

});