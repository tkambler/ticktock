'use strict';

exports = module.exports = function(config, appDir) {

    const fs = require('app/fs');
    const path = require('path');
    const dbFile = '/var/ticktock/db.sqlite3';
    
    const knex = require('knex')({
        'client': 'sqlite3',
        'connection': {
            'filename': dbFile
        },
        'useNullAsDefault': true,
        'migrations': {
            'directory': path.resolve(appDir, 'migrations')
        },
        'seeds': {
            'directory': path.resolve(appDir, 'seeds')
        }
    });
    
    return fs.ensureDirAsync(path.dirname(dbFile))
        .then(() => {
            
            return knex.migrate.latest({
                'disableTransactions': true
            });
            
        })
        .then(() => {

            return knex;

        });

};

exports['@singleton'] = true;
exports['@require'] = ['config', 'appDir'];
