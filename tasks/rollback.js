'use strict';

module.exports = (grunt) => {

    grunt.registerTask('rollback', 'Rollback the latest Knex migration', function() {

        const done = this.async();
        const knex = require('services/knex');

        return knex.migrate.rollback({
            'disableTransactions': true
        })
            .then(done)
            .catch(grunt.fatal);

    });

};