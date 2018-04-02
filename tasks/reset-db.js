'use strict';

module.exports = (grunt) => {

    grunt.registerTask('reset-db', 'Reset the DB', function() {

        const config = require('services/config');
        const fs = require('fs');

        try {
            fs.unlinkSync(config.get('db:path'));
        } catch(err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
        
        grunt.task.run(['migrate', 'seed']);

    });

};