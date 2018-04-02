'use strict';

module.exports = (grunt) => {
    
    grunt.config.init({});
    
    grunt.loadTasks('tasks');
    
    grunt.task.run('init');
    
};