'use strict';

module.exports = (grunt) => {

    grunt.registerTask('seed', 'Import Knex seeds', function() {

        const done = this.async();
        const config = require('services/config');
        const knex = require('services/knex');

        return knex.seed.run(config.get('db:seeds'))
            .then(done)
            .catch(grunt.fatal);

    });

};