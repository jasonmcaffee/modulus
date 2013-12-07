module.exports = function (grunt) {
    //modules
    var handlebars = require('handlebars');

    var uglifyConfig = {};

    var modulusWebsite = {
        dist:'dist/modulusjs.org',
        src: 'modulusjs.org/source'
    };

    with(modulusWebsite){
        modulusWebsite.cssSrc = src + '/css';
        modulusWebsite.cssDist = dist + '/css';
        modulusWebsite.jsSrc = src + '/js';
        modulusWebsite.jsDist = dist + '/js';
    }

    grunt.initConfig({
        modulus:{
            site: modulusWebsite
        },
        jasmine: {
            modulus:{
                src: 'todo',
                options: {
                    specs: 'test/spec/*Spec.js',
                    helpers: 'test/spec/*Helper.js'
                }
            }
        },
//        watch: {
//            scripts: {
//                files: ['src/**/*.js'],
//                tasks: ['build']
//            },
//            specs: {
//                files: ['test/spec/**/*.js'],
//                tasks: ['test']
//            }
//        },
        uglify: {
            options: {
                //http://lisperator.net/uglifyjs/compress
                compress:{
                    sequences     : false,  // join consecutive statemets with the “comma operator”
                    properties    : false,  // optimize property access: a["foo"] → a.foo
                    dead_code     : true,  // discard unreachable code
                    drop_debugger : true,  // discard “debugger” statements
                    unsafe        : false, // some unsafe optimizations (see below)
                    conditionals  : false,  // optimize if-s and conditional expressions
                    comparisons   : false,  // optimize comparisons
                    evaluate      : false,  // evaluate constant expressions
                    booleans      : false,  // optimize boolean expressions
                    loops         : false,  // optimize loops
                    unused        : true,  // drop unused variables/functions
                    hoist_funs    : false,  // hoist function declarations
                    hoist_vars    : false, // hoist variable declarations
                    if_return     : false,  // optimize if-s followed by return/continue
                    join_vars     : false,  // join var declarations
                    cascade       : false,  // try to cascade `right` into `left` in sequences
                    side_effects  : true,  // drop side-effect-free statements
                    warnings      : true,  // warn about potentially dangerous optimizations/code
                    global_defs   : {}     // global definitions
                },

                report: 'gzip'
            },
            modulus: {files: uglifyConfig}
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadTasks('grunt-tasks/test/buildtime-project');
    grunt.loadTasks('grunt-tasks/test/buildtime-project2');
    grunt.loadTasks('grunt-tasks/test/buildtime-project3');

    grunt.loadTasks('grunt-tasks/modulusjs.org');

//    grunt.registerTask('test', ['jasmine']);
//    grunt.registerTask('build', ['', 'jasmine:modulus']);
//    grunt.registerTask('build-and-minify', ['build', 'uglify:modulus']);
//
//    grunt.registerTask('default', ['compile-nn-templates', 'test', 'uglify']);
};