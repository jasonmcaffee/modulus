//var FS = require("q-io/fs");
var Q = require('q');
var glob = require("glob");
var fs = require('fs');

/**
 * Primary export. All functions and properties should be attached to this.
 */
function modulus(){
}
//https://github.com/Marak/colors.js/blob/master/colors.js
var colors={
    'white'     : ['\x1B[37m', '\x1B[39m'],
    'grey'      : ['\x1B[90m', '\x1B[39m'],
    'black'     : ['\x1B[30m', '\x1B[39m'],
    //colors
    'blue'      : ['\x1B[34m', '\x1B[39m'],
    'cyan'      : ['\x1B[36m', '\x1B[39m'],
    'green'     : ['\x1B[32m', '\x1B[39m'],
    'magenta'   : ['\x1B[35m', '\x1B[39m'],
    'red'       : ['\x1B[31m', '\x1B[39m'],
    'yellow'    : ['\x1B[33m', '\x1B[39m'],
    //background colors
    //grayscale
    'whiteBG'     : ['\x1B[47m', '\x1B[49m'],
    'greyBG'      : ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG'     : ['\x1B[40m', '\x1B[49m'],
    //colors
    'blueBG'      : ['\x1B[44m', '\x1B[49m'],
    'cyanBG'      : ['\x1B[46m', '\x1B[49m'],
    'greenBG'     : ['\x1B[42m', '\x1B[49m'],
    'magentaBG'   : ['\x1B[45m', '\x1B[49m'],
    'redBG'       : ['\x1B[41m', '\x1B[49m'],
    'yellowBG'    : ['\x1B[43m', '\x1B[49m']
}

/**
 * Used to control logging behavior.
 * TODO: log level configuration
 */
function log(){
    console.log.apply(console, arguments);
}
function logError(message){
    message = colors.red[0] + message + colors.red[1];
    log(message);
}
function logMilestone(message){
    var delta = 80 - message.length;
    if(delta > 0){
        message = message + Array(delta).join('=');
    }
    message = colors.green[0] + '==== '+message + colors.green[1];
    log(message);
}
function rainbowLog(message){
    var newString = "";
    var rainbow = ['red', 'yellow', 'green', 'blue', 'magenta'];
    for(var i=0; i < message.length;++i){
        var char = message[i];
        var rainbowIndex = i % 5;
        var color = rainbow[rainbowIndex];
        var newChar = colors[color][0] + char + colors[color][1];
        newString += newChar;
    }
    log(newString);
}

function stringifyModule(module){
    var newModule = {};
    for(var key in module){
        var newVal = module[key];
        if(key == 'contents'){
            newVal = newVal.slice(0, 20) + '...';
        }
        newModule[key] = newVal;
    }
    var result = JSON.stringify(newModule, null, 2);
    return result;
}
function stringifyModules(modules){
    var result ="";
    for(var i=0; i< modules.length;++i){
        var module = modules[i];
        result += stringifyModule(module);
    }
    return result;
}

/**
 * Wraps an existing function with a new function that first creates a Q.deferred and passes it to the existing function.
 * Returns the deferred.promise.
 * Simplifies redundancies of always creating and returning a promise.
 * 'this' inside the wrapped function may not be what you think it is though.
 * TODO: ensure that 'this' of the wrapped function is the merged config object.
 * @param func - the function to wrap. should expect a deferred as the first param, and that a promise will be returned when it is invoked.
 * @returns {Function}
 */
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

/**
 * Shallow merge of defaults and overrides into a new object which is returned.
 * Similar to _.extend or $.extend
 * @param - defaults - default values, which are gauranteed to exist unless overridden by overrides param
 * @param - overrides - any properties you wish to override
 * @returns - {} - object representing the merger between defaults and overrides.
 */
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

/**
 * Default configuration object.
 * Advanced configurations property names have '_' prepended to them.
 * All functionality is granular and overridable via the modulus config param. e.g. module.build({yourconfig...}, ...)
 * Customize Modulus however you see fit!!! (just make sure you follow the API. e.g. You will need Q for any promise functions)
*/
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
//    shim:{
//        '$':{
//            path: 'src/vendor/jquery-1.9.1.js',
//            dependencies:[],
//            exports:'$'
//        }
//    },
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

    /**
     * Searches for modules using glob pattern matching. e.g. '/src/js\/**\/*.js' (disregard the backslashes which are needed to keep this comment block)
     * Returns an array of all matching files. (they should all be .js files)
     * @param basePath - the config's baseDirectory. e.g. 'src/modules'
     * @param globPattern - the glob pattern to use to search for the modules. https://github.com/isaacs/node-glob
     * @returns {Array} - array of file paths to all modules.
     * NOTE: don't let the call to promise confuse you. it just eliminates redundancy by creating a promise each time this function is called.
     */
    _getModuleFilePaths: promise(function(deferred, basePath, globPattern){
        var globPath = basePath + '/' + globPattern;
        log('_getModules called for globPath: %s', globPath);
        glob(globPath, function(err, files){
            if(err){
                deferred.reject(new Error(err));
            }else{
                deferred.resolve(files);
            }
        });
    }),

    /**
     * Creates an object representing all metadata related to the module.
     * Determines if the module is shimmed, and creates special metadata if it is.
     * @param path - file path to the module's js file.
     * @param fileContents - the contents of the module's js file.
     * @returns {{name: string, functionName: string, contents: *, filePath: *}} - metadata
     */
    _createModuleMetadata: function(path, fileContents){
        var module; //return value

        //check for shims
        var name = this._determineModuleNameBasedOnFilePath(path);
        var shimConfigEntry = this._findShimConfigEntryByPropName('path', path);
        //log('shimConfigEntry: %s', JSON.stringify(shimConfigEntry, null, 2));
        if(shimConfigEntry){
            log('shimConfigEntry found for name: %s', shimConfigEntry.name);
            module = {
                name: shimConfigEntry.name,
                contents: fileContents.toString(),
                functionName: shimConfigEntry.name,
                dependencies: shimConfigEntry.dependencies,
                filePath: path,
                isShim: true
            };
        }else{
            var funcName = this._determineModuleFunctionNameBasedOnFileContents(fileContents);
            if(!funcName){
                funcName = this._handleUnableToDetermineFuncName(name, path);//give chance to fix the issue.
            }
            //if a functionName can't be found (due to empty contents) just make it the
            module = {
                //how the module is referenced by other modules. e.g. function moduleB(moduleA)
                name: name,
                //the global function name that can be executed. should match name.
                functionName: this._determineModuleFunctionNameBasedOnFileContents(fileContents),
                contents: fileContents.toString(),
                filePath: path
            };
            module.dependencies = this._determineModuleDependencies(module.name, module.contents, module.filePath);
        }
        return module;
    },

    _handleUnableToDetermineFuncName: function(name, path){
        throw 'Unable to determine the function name for module named: ' + name + ' at path: ' + path;
    },

    /**
     * Finds a shim config entry by the specified prop
     * @param propName - the prop name you wish to search by. use 'key' for matching by left side. e.g. '$': {...}
     * @param propVal - the value the propName should evaluate to.
     * @returns right side of shim config entry, with a new name property. e.g. {name:'$', dependencies:[], exports:'$'}
     */
    _findShimConfigEntryByPropName: function(propName, propVal){
        if(!this.shim){return;}
        var shimEntry;
        for(var shimName in this.shim){
            shimEntry = this.shim[shimName];
            //log('evaluating shimEntry: %s', JSON.stringify(shimEntry, null, 2));
            shimEntry.name = shimName; //modify the config so the name matches the key. todo: cleaner way of doing this.
            if(propName == 'key' && propVal == shimName){
                return shimEntry;
            }else if(shimEntry[propName] == propVal){
                return shimEntry;
            }
        }
        return null;
    },

    /**
     * Used to construct module metadata 'name'
     * Uses the filepath to construct module name. '/some/dir/myModule.js' becomes 'myModule'
     * @param path - file path string for the module.
     * @returns {string} - module name. e.g. 'myModule'
     */
    _determineModuleNameBasedOnFilePath:function(path){
        var name = path.substr(path.lastIndexOf('/') + 1);
        name = name.replace('.js', '');
        return name;
    },

    /**
     * Used to construct module metadata 'functionName'
     * Parses the module's file contents to obtain the name of the function which the module uses.
     * @param contents - the contents of the module file. expects a 'function moduleName()' format
     * @returns {string} - the name of the function representing the module's init
     */
    _determineModuleFunctionNameBasedOnFileContents: function(contents){
        var reg =/function(.*)\(/g;
        var matches = reg.exec(contents);
        var funcName = matches? matches[1] : '';
        funcName = funcName.replace(/\s/g, '');
        return funcName;
    },

    /**
     * Used to construct the module metadata 'dependencies'.
     * Evaluates the module's function parameters and constructs an array of strings.
     * e.g. function myModule(moduleA, moduleB) results in ['moduleA', 'moduleB']
     * @param name
     * @param contents
     * @param path
     * @returns {Array} - string array of dependency names.
     */
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

    /**
     * Reads modules from disk and creates metadata for each.
     * @param filePaths - array of file paths.
     * @returns {Q promise} - promise
     */
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

    /**
     * Reads a module from disk and creates metadata for it. {name:'moduleA', functionName:'moduleA', ...}
     * @param path - path to the module
     * @returns {Q promise} - promise
     */
    _readModule:function(path){
        log('readModule called for path: %s', path);
        var contents, d= Q.defer();
        fs.readFile(path, null, function(err, data){
            if(err){ log('error!'); d.reject(new Error(err)); return;}
            //log('creating module meta for path: %s', path);
            var module = this._createModuleMetadata(path, data);
            d.resolve(module);
        }.bind(this));

        return d.promise;
    },

    //In Progress: write runtime config.
    //for
    includeRuntimeShimConfig : true,
    includeRuntimeModuleConfig: false, //todo: if they dont want to scan context for modules, we can write out all module metadata.
    _createRuntimeConfig: function(modules){
        var runtimeConfig = {};
        for(var i=0; i < modules.length; ++i){
            var module = modules[i];
            runtimeConfig[module.name] = module;
        }
        return runtimeConfig;
    },

    _createRuntimeShimConfig: function(modules){
        var runtimeConfig = this._createRuntimeConfig(modules);
    },

    /**
     * Searches for modules with the propName that matches the prop value.
     * e.g. _findModulesByPropName(modules, 'name', 'moduleA')
     * @param modules - array of modules to search
     * @param propName - name of the prop to evaluate
     * @param propVal - value to match
     * @returns {Array} - array of matches
     */
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

    /**
     * makes sure that no duplicate modules exist, functionName matches name, etc
     * @param modules - array of modules you wish to validate against.
     * @returns {Array} - error messages, which include the module metadata they pertain to so you can track down what is causing the error.
     */
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

            if(module.name != module.functionName){
                var message = "Module name: " + module.name + " does not match Module functionName: " + module.functionName;
                errors.push(message);
            }
        }

        return errors;
    },

    /**
     * The result of validateReadModules is passed to here.  By default we throw the errors, but you can choose to override and handle however you see fit.
     * @param errors - array of errors
     * @param errorback - optional - function to execute for build failures. (you should probably just throw though so the build function can complete)
     */
    _handleValidationErrors: function(errors, errorback){
        if(errors.length > 0){
            throw errors;
        }
    },

    /**
     * Iterates over the config.dist.files to build the concatenated dist files.
     * @param config - complete config object
     * @param allModules - all modules read from disk (result of _readModules)
     * @returns {Q promise} - promise
     */
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

    /**
     * Processes a single entry in the config.dist property.
     * Finds all dependencies, concatenates them into 1 file, and writes to dist dir.
     * @param distFileName - the name of the built file to be written
     * @param distFileConfig - the config entry in config.dist
     * @param config - the complete config object.
     * @param allModules - all modules read from disk (result of _readModules)
     * @returns {Q promise} - promise
     */
    _processDistConfig: function(distFileName, distFileConfig, config, allModules){
        log("_processDistConfig called for dist file: %s", distFileName);

        //recursively find dependencies
        var initialDeps = this._findModules(distFileConfig.dependencies, allModules);
        var allDependencies = initialDeps.concat(this._recursivelyFindDependencies(initialDeps, allModules));
        var allUniqueDependencies = this._removeDuplicateModules(allDependencies);
        var allUniqueDependenciesWithExclusionsRemoved = this._excludeModules(distFileConfig, allModules, allUniqueDependencies);
        var allUniqueOrderedDependencies = this._reorderModules(allUniqueDependenciesWithExclusionsRemoved);//put shims at the top
        log('found %s dependencies for distFileName %s', allUniqueOrderedDependencies.length, distFileName);

        //create a big string
        var distFileContents = this._combineModuleContentsToOneString(allUniqueOrderedDependencies);

        //build up the runtime configuration as well? maybe. for now just let it happen at runtime.
        //log('distFileContents: \n %s', distFileContents);
        return this._writeBuiltFileToDisk(distFileName, distFileConfig, config, distFileContents);
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

    /**
     * Finds excluded modules in the distFileConfig and removes them from currentModules param.
     * @param distFileConfig -
     * @param allModules
     * @param currentModules
     * @returns {Array}
     * @private
     */
    _excludeModules: function(distFileConfig, allModules, currentModules){
        if(!distFileConfig.excludes){return currentModules;}
        var modulesAfterExclusion = [];
        //get the excluded modules and their dependencies. none shall be included.
        var exludedModules = this._findModules(distFileConfig.excludes, allModules);
        var excludedModulesAndDependencies = this._recursivelyFindDependencies(exludedModules, allModules);
        log('excluding %s modules', excludedModulesAndDependencies.length);
        modulesAfterExclusion = currentModules.filter(function(i){
            return excludedModulesAndDependencies.indexOf(i) < 0;
        });
        return modulesAfterExclusion;
    },

    /**
     * reorders modules.
     * Called on in _processDistConfig right before writing to disk.
     * useful for shim config entries being placed at the top of the file.
     * @param modules
     */
    _reorderModules: function(modules){
        var reordered =[];
        //todo: this is dirty sorting. do better.
        for(var i = 0; i < modules.length; ++i){
            var module = modules[i];
            if(module.isShim){
                reordered.push(module);
            }
        }
        for(var i = 0; i < modules.length; ++i){
            var module = modules[i];
            if(!module.isShim){
                reordered.push(module);
            }
        }
        return reordered;
    },

    //writes a built file to disk.
    /**
     * Writes the processed dist config entry to disk.
     * @param distFileName - the path to the file. e.g. ./dist/myFile.js
     * @param distFileConfig - optional - the config entry for the file.
     * @param config - optional - the entire config
     * @param distFileContents - the contents of the file. e.g. all the dependencies.
     * @returns {*} - Q promise
     */
    _writeBuiltFileToDisk: function(distFileName, distFileConfig, config, distFileContents){
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
        //log('_findModules called');
        var foundModules =[];
        for(var i =0; i < allModules.length; ++i){
            var potentialModule = allModules[i];
            var matchIndex = arrayOfModuleNames.indexOf(potentialModule.name);
            if(matchIndex >= 0){
                //log('_findModules adding found module: %s', potentialModule.name);
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
            //log('dependencyModule is %s', stringifyModule(dependencyModule));

            var depModuleDeps = this._findModules(dependencyModule.dependencies, allModules);
                log('found %s depModuleDeps for dependencies [%s]', depModuleDeps.length, dependencyModule.dependencies);

            //add nested deps first so they are at the top of the file.
            var nestedDeps = this._recursivelyFindDependencies(depModuleDeps, allModules);
            foundModules = foundModules.concat(nestedDeps);

            foundModules = foundModules.concat(depModuleDeps);
                log('foundModules length %s', foundModules.length);


        }

        return foundModules;
    },

    /**
     * iterates over the module metadata (which should have a content property), combining them all together into 1 string.
     * helps for writing the built file to disk.
     * @param modules - array of modules whose content will be concatenated together into a string.
     * @returns {string} - combined contents of all passed in modules
     */
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

/**
 * Primary build function which processes the config, reads all module contents, determines dependencies, and writes the final
 * file(s) to dist.
 * Supports either callback option or promise option.
 * @param configOverrides - all functions for modulus are overridable! you can completely customize the build to your liking.
 * @param callback - optional- function to be executed once the build has been completed.
 * @param errorback - optional- function to be executed if any build errors are encountered.
 */
modulus.build = function(configOverrides, callback, errorback){
    logMilestone('modulus build called.');
    //allow all configuration options to be overridable.
    var config = merge(defaults, configOverrides);
    //support both callback and promise based usages.
    var deferred = Q.defer();
    var start = new Date().getTime();
    //build the dist files.
    //first get all the file paths for every module
    logMilestone('reading all file paths');
    config._getModuleFilePaths(config.baseDirectory, config.modulePattern)
        //next, read the contents of all the file paths and construct metadata for each module (name, functionName, contents, etc)
        .then(function(filePaths){
            log('files received! %s', filePaths);
            logMilestone('creating module metadata');
            return config._readModules(filePaths);
        })
        //validate the metadata (no duplicates, etc), determine all dependencies, and write the concatenated dependent modules to disk.
        .then(function(modules){
            log('readModules complete. \n %s', stringifyModules(modules));
            logMilestone('validating module metadata');
            var errors = config._validateReadModules(modules);
            //by default this throws the errors, which triggers the fail promise, which calls the errorback.
            config._handleValidationErrors(errors, errorback);
            //find all dependencies, group them together into the dist file(s)
            logMilestone('processing dist configs and writing to disk');
            return config._processDistConfigs(config, modules);
        })
        //call the callback function, indicating that the build is complete.
        .then(function(){
            var end = new Date().getTime();
            var total = end - start;
            log('build completed in %s ms', total);
            rainbowLog('♥♥♥♥ modulus loves you ♥♥♥♥');
            if(callback){
                callback();
            }
            deferred.resolve();
        })
        //any exceptions along the way end up here.
        .fail(function(err){
            var end = new Date().getTime();
            var total = end - start;
            log('build failed in %s ms', total);
            if(errorback){
                errorback(err);
            }else{
                log('ERROR: %s', err);
            }
            deferred.reject(err);
        });
    return deferred.promise;
};


module.exports = modulus;
