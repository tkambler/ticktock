'use strict';

module.exports = (grunt) => {

    /**
     * Migrates the database to a specified migration point.
     *
     * @example $ grunt migrate
     */
    grunt.registerTask('migrate', 'Run Knex migrations', function() {

        const done = this.async();
        const knex = require('services/knex');

        return knex.migrate.latest({
            'disableTransactions': true
        })
            .then(done)
            .catch(grunt.fatal);

    });

};