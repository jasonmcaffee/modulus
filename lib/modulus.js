//var FS = require("q-io/fs");
var Q = require('q');
var glob = require("glob");

function modulus(){

}
function log(){
    console.log.apply(console, arguments);
}

function merge(defaults, overrides){
    var result = {};
    for(var key in defaults){
        result[key]=defaults[key];
    }
    for(var key in overrides){
        result[key]=overrides[key];
    }
    return result;
}

var defaults = {
    //the directory which should be scanned to find modules
    baseDirectory: 'src/modules',
    distDirectory: 'dist',
    modulePattern: '**/*.js',
    //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
    shim:{
        '$':{
            path: 'src/vendor/jquery-1.9.1.js',
            dependencies:[],
            exports:'$'
        }
    },
    map:{
        requestsFor:{
            'moduleA':{
                from:{
                    'moduleB':{

                    }
                }
            }
        },
        requestsFrom:{
            'moduleB':{
                for:{
                    'moduleA':{
                        shouldGetThisModuleInstead:{
                            'moduleB':{
                                //any configuration overrides
                            }
                        },
                        //or
                        executeThisFirst: function(moduleA){

                        }
                        //...
                    }
                }
            }
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
    },

    //module retreval
    _getModules: function(basePath, globPattern){
        var d = Q.defer();
        var globPath = basePath + '/' + globPattern;
        log('_getModules called for globPath: %s', globPath);
        glob(globPath, function(err, files){
            log('glob Returned');
            if(err){
                d.reject(new Error(err));
            }else{
                d.resolve(files);
            }
        });
        return d.promise;
    }
};

modulus.build = function(configOverrides, callback, errorback){
    log('modulus build called.');
    var config = merge(defaults, configOverrides);

    config._getModules(config.baseDirectory, config.modulePattern)
        .then(function(filePaths){
            log('files received! %s', filePaths);
            callback(filePaths);
        })
        .fail(function(err){
            log('ERROR: %s', err);
            errorback(err);
        });
};


module.exports = modulus;
