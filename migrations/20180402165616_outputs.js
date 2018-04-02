'use strict';

exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('outputs', (table) => {
        
        table.increments();
        table.string('task_id').notNull();
        table.string('std_out');
        table.string('std_err');
        table.string('exit_code').notNull();
        table.string('date').notNull();
        table.string('start_ts').notNull();
        table.string('end_ts').notNull();
        
    });
  
};

exports.down = function(knex, Promise) {
    
    return knex.schema.dropTable('outputs');
  
};
