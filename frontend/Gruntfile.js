'use strict';

module.exports = function(grunt) {

    require('time-grunt')(grunt);

    require('load-grunt-tasks')(grunt, {
        'pattern': [
            'grunt-*',
            'gruntify-eslint'
        ]
    });

    grunt.initConfig({
        'pkg': require('./package.json'),
        'uglify': {
            'options': {
                'mangle': false,
                'beautify': true,
                'sourceMap': {
                    'includeSources': true
                }
            },
            'vendor': {
                'files': {
                    'public/js/vendor.js': [
                        'node_modules/jquery/dist/jquery.js',
                        'node_modules/moment/moment.js',
                        'node_modules/lodash/lodash.js',
                        'node_modules/underscore.string/dist/underscore.string.js',
                        'node_modules/bluebird/js/browser/bluebird.js',
                        'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
                        'node_modules/angular/angular.js',
                        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
                        'node_modules/angular-ui-router/release/angular-ui-router.js',
                        'node_modules/angular-sanitize/angular-sanitize.js',
                        'node_modules/restangular/dist/restangular.min.js',
                        'node_modules/angular-validation-match/dist/angular-validation-match.js',
                        'node_modules/angular-loading-bar/src/loading-bar.js',
                        'node_modules/angular-json-tree/dist/angular-json-tree.js',
                        'node_modules/jstree/dist/jstree.js',
                        'node_modules/ng-js-tree/dist/ngJsTree.js',
                    ]
                }
            }
        },
        'connect': {
            'server': {
                'options': {
                    'port': 9070,
                    'base': 'public',
                    'keepalive': true
                }
            }
        },
        'eslint': {
            'options': {
                'configFile': '.eslintrc.js',
                'fix': true
            },
            'target': ['src/**/*.js']
        },
        'compass': {
            'all': {
                'options': {
                    'httpPath': '/',
                    'cssDir': 'public/css',
                    'sassDir': 'scss',
                    'specify': [
                        'scss/style.scss'
                    ],
                    'imagesDir': 'public/images',
                    'relativeAssets': true,
                    'outputStyle': 'compressed',
                    'importPath': [
                        'node_modules'
                    ]
                }
            }
        },
        'concurrent': {
            'build-serve': {
                'options': {
                    'logConcurrentOutput': true,
                    'limit': 5
                },
                'tasks': ['connect', 'webpack:watch', 'watch:compass', 'watch:uglify', 'watch:assets']
            },
            'webpack-serve': {
                'options': {
                    'logConcurrentOutput': true,
                    'limit': 5
                },
                'tasks': ['connect', 'webpack:watch']
            }
        },
        'watch': {
            'compass': {
                'files': ['Gruntfile.js', 'scss/**/*'],
                'tasks': ['compass']
            },
            'uglify': {
                'files': ['Gruntfile.js'],
                'tasks': ['uglify']
            },
            'assets': {
                'files': ['assets/**/*'],
                'tasks': ['copy:assets']
            }
        },
        'cssmin': {
            'vendor': {
                'files': {
                    'public/css/vendor.css': [
                        'node_modules/noty/lib/noty.css',
                        'node_modules/animate.css/animate.css',
                        'node_modules/angular-loading-bar/src/loading-bar.css',
                        'node_modules/angular-json-tree/dist/angular-json-tree.css',
                    ]
                }
            }
        },
        'clean': {
            'everything': ['public/**/*']
        },
        'copy': {
            'fonts': {
                'files': [
                    {
                        'expand': true,
                        'cwd': 'node_modules/opensans-npm-webfont/fonts',
                        'src': '**/*',
                        'dest': 'public/css/fonts'
                    },
                    {
                        'expand': true,
                        'cwd': 'node_modules/bootstrap-sass/assets/fonts/bootstrap',
                        'src': '**/*',
                        'dest': 'public/css/fonts'
                    },
                    {
                        'expand': true,
                        'cwd': 'node_modules/font-awesome/fonts',
                        'src': '**/*',
                        'dest': 'public/css/fonts'
                    }
                ]
            },
            'assets': {
                'files': [
                    {
                        'expand': true,
                        'cwd': 'assets',
                        'src': '**/*',
                        'dest': 'public'
                    }
                ]
            },
            'misc': {
                'files': [
                    {
                        'expand': true,
                        'cwd': 'node_modules/jstree/dist/themes',
                        'src': '**/*',
                        'dest': 'public/css/themes'
                    }
                ]
            }
        },
        'webpack': {
            'options': {
                'progress': true,
                'stats': false,
                'storeStatsTo': 'webpackStats'
            },
            'once': require('./webpack.config.js'),
            'watch': Object.assign({ 'watch': true, 'keepalive': true }, require('./webpack.config.js'))
        },
        'replace': {
            'options': {
                'patterns': [
                    {
                        'match': 'timestamp',
                        'replacement': '<%= new Date().getTime() %>'
                    }
                ]
            },
            'index': {
                'files': [
                    {
                        'expand': false,
                        'src': 'public/index.html',
                        'dest': 'public/index.html'
                    }
                ]
            }
        }
    });
    
    grunt.registerTask('save-webpack-stats', function() {
        grunt.file.write('./webpack.stats.json', JSON.stringify(grunt.config.get('webpackStats'), null, 4));
    });

    grunt.registerTask('build', ['clean', 'copy', 'cssmin', 'compass', 'uglify', 'replace', 'webpack:once', 'save-webpack-stats']);
    grunt.registerTask('build-serve', ['clean', 'copy', 'cssmin', 'compass', 'uglify', 'replace', 'concurrent:build-serve']);
    grunt.registerTask('webpack-serve', ['concurrent:webpack-serve']);
    grunt.registerTask('lint', 'eslint');
    grunt.registerTask('default', 'build');

};