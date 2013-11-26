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
        var total = filePaths.length;
        var promises = [];
        for(var i=0; i < total; ++i){
            var filePath = filePaths[i];
            var prom = this._readModule(filePath);
            promises.push(prom);
        }
        return Q.all(promises);
    },

    _readModule:function(path){
        log('readModule called for path: %s', path);
        var contents, d= Q.defer();

//        var readComplete = (function(d, self){
//            return function(err, data){
//                if(err){ log('error!'); d.reject(new Error(err)); return;}
//                var module = self._createModuleMetadata(path, data);
//                d.resolve(module);
//            }
//        })(d, this);
//        fs.readFile(path, null, readComplete);
        fs.readFile(path, null, function(err, data){
            if(err){ log('error!'); d.reject(new Error(err)); return;}
            var module = this._createModuleMetadata(path, data);
            d.resolve(module);
        }.bind(this));

        return d.promise;
    },

    _createRuntimeConfig: function(modules){
        var runtimeConfig = {};
        for(var i=0; i < modules.length; ++i){
            var module = modules[i];
            runtimeConfig[module.name] = module;
        }
        return runtimeConfig;
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

    _processDistConfigs: function(config, allModules){
        log("_processDistConfigs called");
        if(!config || !config.dist || !config.dist.files){
            return new Error("missing dist configuration");
        }
        var dist = config.dist;
        var promises = [];
        for(var distFileName in dist.files){
            var distFileConfig = dist.files[distFileName];
            var prom = this._processDistConfig(distFileName, distFileConfig, config, allModules);
            promises.push(prom);
        }
        return Q.all(promises);
    },

    //returns a promise.
    _processDistConfig: function(distFileName, distFileConfig, config, allModules){
        log("_processDistConfig called for dist file: %s", distFileName);

        //recursively find dependencies
        var initialDeps = this._findModules(distFileConfig.dependencies, allModules);
        var allDependencies = initialDeps.concat(this._recursivelyFindDependencies(initialDeps, allModules));
        var allUniqueDependencies = this._removeDuplicateModules(allDependencies);
        log('found %s dependencies for distFileName %s', allUniqueDependencies.length, distFileName);

        //create a big string
        var distFileContents = this._combineModuleContentsToOneString(allUniqueDependencies);

        //build up the runtime configuration as well? maybe. for now just let it happen at runtime.
        //log('distFileContents: \n %s', distFileContents);
        return this._writeProcessedDistConfigToDisk(distFileName, distFileConfig, config, distFileContents);
    },

    //modules that are referenced more than once end up in the dependency array more than once, so remove them.
    _removeDuplicateModules: function(modules){
        var foundModuleNames = [];
        var uniqueModules = [];
        for(var i=0; i< modules.length; ++i){
            var module = modules[i];
            if(foundModuleNames.indexOf(module.name) <0){
                foundModuleNames.push(module.name);
                uniqueModules.push(module);
            }
        }
        return uniqueModules;
    },

    //writes a built file to disk.
    _writeProcessedDistConfigToDisk: function(distFileName, distFileConfig, config, distFileContents){
        var d = Q.defer();
        log('attempting to write file: %s to disk', distFileName);
        fs.writeFile(distFileName, distFileContents, function(err){
            if(err){
                d.reject(new Error(err));
            }else{
                log('file written!');
                d.resolve();
            }
        });

        return d.promise;
    },

    /**
     * Takes an array of module names e.g. ['moduleA', 'moduleB'], and finds the module representation (with metadata)
     * Useful for finding the real modules when looking at module.dependencies.
     * @param arrayOfModuleNames - the modules you are looking for. e.g. ['moduleA', 'moduleB']
     * @param allModules - the array of modules you wish to look through.
     * @returns {Array} - array of modules from the allModules array whos name match
     */
    _findModules:function(arrayOfModuleNames, allModules){
        log('_findModules called');
        var foundModules =[];
        for(var i =0; i < allModules.length; ++i){
            var potentialModule = allModules[i];
            var matchIndex = arrayOfModuleNames.indexOf(potentialModule.name);
            if(matchIndex >= 0){
                log('_findModules adding found module: %s', potentialModule.name);
                foundModules.push(potentialModule);
            }
        }
        return foundModules;
    },

    //@param dependencyModules - array of real modules (metadata) to gather.
    //todo: worry about infinite loops with modules that depend on each other? maybe not. circular isn't allowed
    // http://stackoverflow.com/questions/4881059/how-to-handle-circular-dependencies-with-requirejs-amd
    /**
     * Finds all child dependencies for every module in the dependencyModules array.
     * WARNING: This does not handle circular dependencies, and you will get a max stack depth exceeded error if you have circular dependencies.
     * @param dependencyModules - array of modules which you want to find all dependencies for, including all child deps.
     * @param allModules - array of modules you want to look through
     * @returns {Array} - array of all dependencies for the dependencyModules. NOTE: does not include the original dependencyModules.
     */
    _recursivelyFindDependencies: function(dependencyModules, allModules){
        var foundModules = [];//dependencyModules.slice(0);//if no foundModules passed, start with the dependencyModules clone
        //depStack = depStack || [];//circular dependency detection
        for(var i=0; i < dependencyModules.length; ++i){
            var dependencyModule = dependencyModules[i];
            log('dependencyModule is %s', JSON.stringify(dependencyModule));

            var depModuleDeps = this._findModules(dependencyModule.dependencies, allModules);
            log('found %s depModuleDeps for dependencies [%s]', depModuleDeps.length, dependencyModule.dependencies);

            foundModules = foundModules.concat(depModuleDeps);
            log('foundModules length %s', foundModules.length);

            var nestedDeps = this._recursivelyFindDependencies(depModuleDeps, allModules);
            foundModules = foundModules.concat(nestedDeps);
        }

        return foundModules;
    },

    //iterates over the module metadata (which should have a content property), combining them all together into 1 string.
    //helps for writing the built file to disk.
    _combineModuleContentsToOneString:function(modules){
        var resultString = "";
        for(var i=0; i < modules.length; ++i){
            var module = modules[i];
            resultString += module.contents + this.concatModuleSeparator;
        }

        return resultString;
    },
    //when modules are distributed, this is used to separate
    concatModuleSeparator: '\n'
};

//main build function
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

            return config._processDistConfigs(config, modules);
        })
        .then(function(){
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
