//var FS = require("q-io/fs");
var Q = require('q');
var glob = require("glob");
var fs = require('fs');

function modulus(){

}
function log(){
    console.log.apply(console, arguments);
}

//sick of creating and returning promises.
//also allows people to use whichever promise lib they want, so long as it adheres to resolve and reject.
function promise(func){
    var context = defaults;// modulus is the context.. may be bad to use defaults as config override... .. not sure..
    return function(){
        var deferred = Q.defer();
        var args = [deferred].concat(Array.prototype.slice.call(arguments, 0));
        func.apply(context, args);
        return deferred.promise;
    }
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
                        shouldGetThisModule:{
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

    //module retrieval
    _getModuleFilePaths: promise(function(deferred, basePath, globPattern){
        var globPath = basePath + '/' + globPattern;
        log('_getModules called for globPath: %s', globPath);
        glob(globPath, function(err, files){
            log('glob Returned');
            if(err){
                deferred.reject(new Error(err));
            }else{
                deferred.resolve(files);
            }
        });
    }),
    _readModule:function(path){
        log('readModule called for path: %s', path);
        var contents, d= Q.defer();
        this._determineModuleName('a/some.js');
        fs.readFile(path, null, function(err, data){
            if(err){ log('error!'); d.reject(new Error(err)); return;}
            var module = {
                name: this._determineModuleName(path)
            };
            log('read module successfully!');
            d.resolve(module);
        }.bind(this));
        return d.promise;
    },

    _determineModuleName:function(path){
        var name = path.substr(path.lastIndexOf('/') + 1);
        name = name.replace('.js', '');
        return name;
    },

    _readModules: function(filePaths){
        log('readModules called');
        var d = Q.defer();
        var total = filePaths.length;
        for(var i=0; i < total; ++i){
            var filePath = filePaths[i];
            this._readModule(filePath).then((function(i, total){
                return function(module){
                    log('module.name: %s i: %s  total: %s', module.name, i, total );
                    if(i >= total -1){
                        log('done _readModules')
                        d.resolve();
                    }
                }
            })(i, total));
        }
        return d.promise;
    }
};

modulus.build = function(configOverrides, callback, errorback){
    log('modulus build called.');

    var config = merge(defaults, configOverrides);

    config._getModuleFilePaths(config.baseDirectory, config.modulePattern)
        .then(function(filePaths){
            log('files received! %s', filePaths);

            return config._readModules(filePaths);
        })
        .then(function(){
            log('readModules complete');
            callback();
        })
        .fail(function(err){
            log('ERROR: %s', err);
            errorback(err);
        });
};


module.exports = modulus;
