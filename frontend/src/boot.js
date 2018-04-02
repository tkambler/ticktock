'use strict';

import app from 'app';
import Promise from 'bluebird';

app.run(function($rootScope, $state, $log, $trace, $transitions) {
    
    $log.debug('App is running.');

    Promise.setScheduler((cb) => {
        $rootScope.$evalAsync(cb);
    });
    
    $transitions.onStart({
    }, (transition) => {
        transition.promise
            .then(() => {
                $rootScope.stateClass = $state.current.name.replace(/\./g, '-');
            });
    });

});