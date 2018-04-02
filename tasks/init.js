'use strict';

module.exports = function(grunt) {

    return grunt.registerTask('init', function() {

        const Ahoy = require('ahoy-di');
        const path = require('path');
        const done = this.async();
        
        const container = new Ahoy({
            'id': 'services',
            'extendRequire': true,
            'services': [
            	path.resolve(__dirname, '../di/services')
            ]
        });
        
        container.constant('appDir', path.resolve(__dirname, '../'));
        
        return container.load('cli')
            .then(done)
            .catch(grunt.fatal);

    });

};