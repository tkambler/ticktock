'use strict';

module.exports = function(grunt) {

    /**
     * Migrates the database to a specified migration point.
     *
     * @example $ grunt create-migration -name my-migration-name
     */
    grunt.registerTask('create-migration', 'Run Knex migrations', function() {

        const done = this.async();
        const knex = require('services/knex');

        if (!grunt.option('name')) {
            return grunt.fatal(`'name' is required`);
        }

        return knex.migrate.make(grunt.option('name'))
            .then(() => {
                return done();
            })
            .catch((err) => {
                return grunt.fatal(err);
            });

    });

};