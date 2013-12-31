module.exports = function(grunt){
    //simple testing, including potential configuration options to come.
    grunt.registerTask('build-buildtime-project2', '', function(){
        var done = this.async();

        function buildComplete(){
            done(true);
        }

        function buildError(errors){
            //throw JSON.stringify(errors, null, 2);
            grunt.fail.fatal(errors);
            done(true);
        }
        //var modulus = require('modulusjs');
        var modulus = require('../../../lib/modulus');

        modulus.build({
            //we must let modulus know the namespace we use for module registry.
            //e.g. if we use ns.moduleA = function(dep1, dep2), then we must specifiy 'ns'
            moduleContextName: 'ns',
            //the directory which should be scanned to find modules
            baseDirectory: 'test/buildtime-project2/js', //the directory to scan for modules.
            modulePattern: '**/*.js', //glob pattern matching
            dist:{
                files:{
                    './dist/test/buildtime-project2/pageOne.js':{
                        dependencies:['pageOne'], //start at module b and include all it's dependencies.
                        excludes:['global']
                    },
                    './dist/test/buildtime-project2/global.js':{
                        dependencies:['global']
                    }
                }
            },
            //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
            shim:{
                '$':{
                    path: 'test/buildtime-project2/js/vendor/jquery-1.10.2.min.js',
                    dependencies:[],
                    exports:'$'
                },
                'Backbone':{
                    path: 'test/buildtime-project2/js/vendor/backbone-1.1.0.min.js',
                    dependencies: ['_', '$'],
                    exports:'Backbone'
                },
                '_':{
                    path: 'test/buildtime-project2/js/vendor/underscore-1.5.2.min.js',
                    dependencies: [],
                    exports:'_'
                }
            }

        }, buildComplete, buildError);
    });
};