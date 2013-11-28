module.exports = function(grunt){
    //simple testing, including potential configuration options to come.
    grunt.registerTask('build-buildtime-project', '', function(){
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
};