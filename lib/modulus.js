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
        //log('caller: %s', arguments.callee);
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
    dist:{
        directory: 'dist',
        files:{
            'moduleC.with.deps.js':{
                modules:['moduleB'] //start at module b and include all it's dependencies.
            }
        }
    },
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
        this._determineModuleNameBasedOnFilePath('a/some.js');
        fs.readFile(path, null, function(err, data){
            if(err){ log('error!'); d.reject(new Error(err)); return;}
            var module = this._createModuleMetadata(path, data);
            d.resolve(module);
        }.bind(this));
        return d.promise;
    },

    _createModuleMetadata: function(path, fileContents){
        var module = {
            //how the module is referenced by other modules. e.g. function moduleB(moduleA)
            name: this._determineModuleNameBasedOnFilePath(path),
            //the global function name that can be executed. should match name.
            functionName: this._determineModuleNameBasedOnFileContents(fileContents),
            contents: fileContents.toString(),
            filePath: path
        };
        module.dependencies = this._determineModuleDependencies(module.name, module.contents, module.filePath);

        return module;
    },

    _determineModuleNameBasedOnFilePath:function(path){
        var name = path.substr(path.lastIndexOf('/') + 1);
        name = name.replace('.js', '');
        return name;
    },

    _determineModuleNameBasedOnFileContents: function(contents){
        var reg =/function(.*)\(/g;
        var matches = reg.exec(contents);//funcString.match(reg)[0];
        var funcName = matches? matches[1] : '';
        funcName = funcName.replace(/\s/g, '');
        return funcName;
    },

    _determineModuleDependencies: function(name, contents, path){
        var reg = /\((.*)\)/g;
        var funcString = contents;
        var matches = reg.exec(funcString);//funcString.match(reg)[0];
        var paramsAsString = matches? matches[1] : '';
        paramsAsString = paramsAsString.replace(/\s/g, '');
        var deps;
        if(paramsAsString == ''){
            deps = [];
        }else{
            deps = paramsAsString.split(',');
        }

        return deps;
    },

    _readModules: function(filePaths){
        log('readModules called');
        var d = Q.defer();
        var total = filePaths.length;
        var modules = [];//return value
        for(var i=0; i < total; ++i){
            var filePath = filePaths[i];
            this._readModule(filePath).then((function(i, total){
                return function(module){
                    log('module.name: %s i: %s  total: %s', module.name, i, total );
                    modules.push(module);
                    if(i >= total -1){
                        log('done _readModules');
                        d.resolve(modules);
                    }
                }
            })(i, total));
        }
        return d.promise;
    },

    //iterates over the module metadata (which should have a content property), combining them all together into 1 string.
    //helps for writing the built file to disk.
    _combineModuleContentsToOneString:function(modules){

    },

    _createRuntimeConfig: function(modules){
        var runtimeConfig = {};
        for(var i=0; i < modules.length; ++i){
            var module = modules[i];
        }
    },

    _findModulesByPropName: function(modules, propName, propVal){
        var result = [];
        for(var i=0; i < modules.length; ++i){
            var module = modules[i];
            if(module[propName] == propVal){
                result.push(module);
            }
        }
        return result;
    },
    //makes sure that no duplicate modules exist, functionName matches name, etc
    _validateReadModules: function(modules){
        var errors = [];

        function findModulesByProp(propName, propVal){
            return this
        }

        for(var i=0; i < modules.length; ++i){
            var module = modules[i];
            var modulesWithSameName = this._findModulesByPropName(modules, "name", module.name);
            var modulesWithSameFunctionName = this._findModulesByPropName(modules, "functionName", module.functionName);
            if(modulesWithSameName.length > 1){
                var message = "Module name " + module.name + " already exists. \n" + JSON.stringify(modulesWithSameName, null, 2);
                errors.push(message);
            }
            if(modulesWithSameFunctionName.length > 1){
                var message = "Module functionName " + module.functionName + " already exists. \n" + JSON.stringify(modulesWithSameFunctionName, null, 2);
                errors.push(message);
            }
        }

        return errors;
    },

    _handleValidationErrors: function(errors, errorback){
        if(errors.length > 0){
            throw errors;
        }
    },

    //since this is build, write out the config object used at runtime.
    _writeModuleMetadataConfig:function(){

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
        .then(function(modules){
            log('readModules complete. \n %s', JSON.stringify(modules, null, 2));
            var errors = config._validateReadModules(modules);
            //by default this throws the errors, which triggers the fail promise, which calls the errorback.
            config._handleValidationErrors(errors, errorback);

            //read the dist config, find the deps
            //make sure not to include something twice!
            callback();
        })
        .fail(function(err){
            //log('ERROR: %s', err);
            errorback(err);
        });
};


module.exports = modulus;
