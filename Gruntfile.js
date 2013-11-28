module.exports = function (grunt) {
    //modules
    var handlebars = require('handlebars');

    var buildVersion = "0.0.1",
        minFileName = "nn-" + buildVersion + ".min.js",
        nnCoreCommonJsFileName = "nn-" + buildVersion + ".js",
        nnCoreCommonJsDistFilePath = 'dist/commonjs/' + nnCoreCommonJsFileName,
        nnCoreTemplateSrcFilePath = 'src/nn.hbs.js',
        nnCoreDistFilePath = 'dist/' + minFileName,
        uglifyConfig = {};
    //uglify from the dist to the dist.
    uglifyConfig[nnCoreDistFilePath] = [nnCoreDistFilePath];

    grunt.initConfig({
        nn:{
            core:{
                templateSrcFilePath: nnCoreTemplateSrcFilePath,
                distFilePath: nnCoreDistFilePath,
                commonJsDistFilePath: nnCoreCommonJsDistFilePath,
                templateData:{
                    version: buildVersion
                }
            }
        },
        jasmine: {
            modulus:{
                src: nnCoreDistFilePath,
                options: {
                    specs: 'test/spec/*Spec.js',
                    helpers: 'test/spec/*Helper.js'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['build']
            },
            specs: {
                files: ['test/spec/**/*.js'],
                tasks: ['test']
            }
        },
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
            nnCore: {files: uglifyConfig}
        }
    });

    grunt.registerTask('build-testProject', '', function(){
        var start = new Date().getTime();
        var done = this.async();

        function buildComplete(){
            var end = new Date().getTime();
            var total = end - start;
            console.log('build complete in %s ms', total);
            done(true);
        }

        function buildError(errors){
            var end = new Date().getTime();
            var total = end - start;
            console.log('build failed in %s ms', total);
            //throw JSON.stringify(errors, null, 2);
            grunt.fail.fatal(errors);
            done(true);
        }
        //var modulus = require('modulusjs');
        var modulus = require('./lib/modulus');

        modulus.build({
            //the directory which should be scanned to find modules
            baseDirectory: 'test/buildtime-project/js', //the directory to scan for modules.
            modulePattern: '**/*.js', //glob pattern matching
            dist:{
                files:{
                    './dist/test/buildtime-project/pageOne.js':{
                        dependencies:['pageOne'], //start at module b and include all it's dependencies.
                        excludes:['global'] //todo: for pages that have a global.js and a page.js
                    },
                    './dist/test/buildtime-project/global.js':{
                        dependencies:['global']
                    }
                }
            },
            //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
            shim:{
                '$':{
                    path: 'test/buildtime-project/js/vendor/jquery-1.10.2.min.js',
                    dependencies:[],
                    exports:'$'
                },
                'Backbone':{
                    path: 'test/buildtime-project/js/vendor/backbone-1.1.0.min.js',
                    dependencies: ['_', '$'],
                    exports:'Backbone'
                },
                '_':{
                    path: 'test/buildtime-project/js/vendor/underscore-1.5.2.min.js',
                    dependencies: [],
                    exports:'_'
                }
            }

        }, buildComplete, buildError);

    });
    //simple testing, including potential configuration options to come.
    grunt.registerTask('test-commonjs-module', '', function(){
        var start = new Date().getTime();
        var done = this.async();

        function buildComplete(){
            var end = new Date().getTime();
            var total = end - start;
            console.log('build complete in %s ms', total);
            done(true);
        }

        function buildError(errors){
            var end = new Date().getTime();
            var total = end - start;
            console.log('build failed in %s ms', total);
            //throw JSON.stringify(errors, null, 2);
            grunt.fail.fatal(errors);
            done(true);
        }
        //var modulus = require('modulusjs');
        var modulus = require('./lib/modulus');
        //noinspection JSValidateTypes
        modulus.build({
            //the directory which should be scanned to find modules
            baseDirectory: 'src/modules', //the directory to scan for modules.
            dist:{
                files:{
                    './dist/moduleB.all.js':{
                        dependencies:['moduleB'], //start at module b and include all it's dependencies.
                        excludeDependenciesFoundIn:['someOtherBuiltModule.js'] //todo: for pages that have a global.js and a page.js
                    }
                }
            },
            modulePattern: '**/*.js', //glob pattern matching
            //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
            shim:{
                '$':{
                    path: 'src/vendor/jquery-1.9.1.js',
                    dependencies:[],
                    exports:'$'
                }
            },
            //process the module however you want.
            onRegisterModule: function(moduleMetadata){

            },

            onUniqueModuleNameError: function(){

            },
            moduleMetadata:{
                'moduleA' :{
                    //...any metadata
                }
            }

        }, buildComplete, buildError);

    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('build', ['compile-nn-core-templates', 'jasmine:modulus']);
    grunt.registerTask('build-and-minify', ['build', 'uglify:nnCore']);

    grunt.registerTask('default', ['compile-nn-templates', 'test', 'uglify']);
};