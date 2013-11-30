(function(modulusContext){
    /**
     * Shallow merge of defaults and overrides into a new object which is returned.
     * Similar to _.extend or $.extend
     * @param defaults - default values, which are gauranteed to exist unless overridden by overrides param
     * @param overrides - any properties you wish to override
     * @returns - {} - object representing the merger between defaults and overrides.
     */
    function merge(defaults, overrides){
        var result = {}, key;
        for(key in defaults){
            result[key]=defaults[key];
        }
        for(key in overrides){
            result[key]=overrides[key];
        }
        return result;
    }

    function log(){
        return;
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }
    }

    var defaults = {
        context: modulusContext, //by default we use the window for the context. e.g. function moduleA(){} ends up on the window.
        _modules: {
//             'moduleX':{
//                 name: moduleMeta.name,
//                 paths: moduleMeta.paths,
//                 deps : this._parseFunctionDependencies(func),
//                 autoInit: moduleMeta.autoInit,
//                 init: func,
//                 initResult: undefined, //result from running init
//                 isInitialized: false,
//                 context: moduleMeta.context //the 'this' for the module init
//             }
        },
        asyncMap:{},

        /**
         * Iterates over the hash of modules, passing each to _initModule so the module and its dependencies can be initialized.
         * @param modules - object hash with name on the left and metadata on the right. e.g. {'moduleA': {name:'moduleA', ...}, 'moduleB': {...} }
         * @returns {Array} - array of results from the init. (needed to pass results into module.init.apply) - these will be in the same order that they appear in the modules hash.
         */
        _initModules:function(modules,callback, errorback){
            var initModulesResults = [];
            modules = modules || this._modules;
            log('_initModules called for %s modules.', modules);
            //boo hiss
            var totalToLoad = 0;
            for(var moduleName in modules){++totalToLoad}
            var i =0;
            var totalLoaded = {count:0};  //put in object so we can increment by ref
            for(var moduleName in modules){

                var module = modules[moduleName];
                this._initModule(module, this._createInitModuleCallback(totalLoaded, totalToLoad, callback, module, initModulesResults, i++), errorback);
                //initModulesResults.push(module.initResult);
            }
            return initModulesResults;
        },
        _createInitModuleCallback:function(totalLoaded, totalToLoad, initModulesCallback, module, initModulesResults, index){
            return function(moduleInitResult){
                //initModulesResults.push(moduleInitResult);
                initModulesResults[index] = moduleInitResult;
                if(++totalLoaded.count >= totalToLoad){
                    //these aren't in the correct order. you will have to sort them.
                    initModulesCallback(initModulesResults);
                }
            }
        },


        /**
         * Runs the module function for the passed in module if the function has not been ran before (module.isInitialized == false)
         * Runs the init for any dependency modules if they have not been initialized
         * Assigns the result of the function to module.initResult.
         *
         * @param module - the module you wish to init.
         * @returns {*} - the result of module();
         */
        _initModule: function giveContext(module, callback, errorback){
            log('init called for module.name: %s', module.name);
            //if the module has already been initialized, return it's result
            if(module.isInitialized){
                callback(module.initResult);
                return;
            }
            try{

                module.asyncSuccessQueue = module.asyncSuccessQueue || [];
                if(callback){ //define and require don't provide a callback
                    module.asyncSuccessQueue.push(callback);
                }

                if(module.isAsync){
                    if(!this.asyncFileLoad){ throw 'async module defined, but there is no asynFileLoad function provided. You must provide asyncFileLoad via init configuration';}

                    if(module.isAsyncInProgress){

                    }else{
                        module.isAsyncInProgress = true;
                        //divide and conquer. load the file and it's dependencies at the same time.

                        if(module.isShim){


                        }else{
                            //DON'T DO IT THIS WAY FOR SHIMs. Load the dependencies first. maybe don't ever do it this way.
                            this.asyncFileLoad(module.name, (function(module, config){
                                return function(){
                                    log('async load completed for %s completed', module.name);

                                    if(module.dependencies.length > 0 && !module.isDependencyLoadingComplete && !module.areDependenciesLoading){
                                        log('async module %s loaded but has dependencies that were found after load.', module.name);
                                        config._loadModuleDependencies(module, function(module){
                                            module.asyncComplete = true;
                                            module.isAsyncInProgress = false;
                                            config._executeCallbacksIfModuleIsDoneLoading(module);//static function
                                        });
                                    }else{
                                        module.asyncComplete = true;
                                        module.isAsyncInProgress = false;
                                        config._executeCallbacksIfModuleIsDoneLoading(module);//static function
                                    }
                                }
                            })(module, this), errorback);

                            //DON'T DO THIS. If backbone loads before it's dependency Underscore, there will be a script error.
                            //if the module is not a partial, it will already have dependencies defined, so try to load them asap.
                            if(module.dependencies && module.dependencies.length > 0){
                                this._loadModuleDependencies(module, this._executeCallbacksIfModuleIsDoneLoading);
                            }
                        }

                    }

                }
                //retrieve module metadata for the dependencies
                else if(module.dependencies && module.dependencies.length > 0){
                    this._loadModuleDependencies(module, this._executeCallbacksIfModuleIsDoneLoading, errorback);

                }else{
                    //run the module init
                    module.initResult = module.init.apply(undefined, []);
                    module.isInitialized = true;
                    callback(module.initResult);
                }
            }catch(e){
                var errorMessage = 'modulus: error initializing module.name: ' + (module.name || 'anonymous' )+ '\n error:'; //+ ' \n error: ' + e
                console.error(errorMessage);
                e.message = errorMessage + e.message;
                throw e; //do not swallow exceptions! if there's any error in the module init, we need to let it propogate.
            }

            //return module.initResult;
        },
        //static function. should have no references to this.
        _executeCallbacksIfModuleIsDoneLoading:function(module){
            if(!module.isAsync ||(module.isAsync && module.asyncComplete)){
                //if(module.dependencies.length == 0 || module.resolvedDependencies){
                if(!module.areDependenciesLoading){
                    //todo: is shim eval needed.
                    if(module.isShim){
                        module.initResult = eval(module.shimConfig.exports);
                        module.isInitialized = true;
                    }else{
                        //todo: reregister all things now that the module is loaded. may need eval if shim.
//                        if(modulus.config.context == window){
//                            modulus.config._findAndRegisterModules();
//                        }
                        //run the module init
                        module.initResult = module.init.apply(undefined, module.resolvedDependencies);
                        module.isInitialized = true;
                    }

                    for(var i=0; i<module.asyncSuccessQueue.length;++i){
                        var cb = module.asyncSuccessQueue[i];
                        cb(module.initResult);
                    }
                    module.asyncSuccessQueue = [];
                }
            }
        },
        _loadModuleDependencies: function(module, callback, errorback){
            module.areDependenciesLoading = true;
            var modules = this._getModules(module.dependencies);
            log('module.name: %s depends on modules %s', module.name, module.dependencies);

            //init all dependencies
            //resolvedDependencies = this._initModules(modules);//make sure all dependencies are initialized.
            this._initModules(modules, (function(module){
                return function(resolvedDependencies){
                    module.resolvedDependencies = resolvedDependencies;
                    module.areDependenciesLoading = false;
                    module.isDependencyLoadingComplete = true;
                    callback(module);
                }
            })(module), function(error){
                errorback(error);
            });
        },

        /**
         * Finds all modules by name.
         * @param arrayOfModuleNames - array of module names you wish to retrieve. e.g. ['moduleA', 'moduleB']
         * @returns {{}} - object hash with name on the left and metadata on the right. e.g. {'moduleA': {name:'moduleA', ...}, 'moduleB': {...} }
         */
        _getModules: function(arrayOfModuleNames){
            var result = {
                //'moduleX': {}
            };
            for(var i=0; i < arrayOfModuleNames.length; ++i){
                var moduleName = arrayOfModuleNames[i];
                var module = this._modules[moduleName];
                if(module){
                    result[module.name] = module;
                }else{
                    //if(this.asyncMap && this.asyncMap[moduleName]){
                        //the requested module has not been registered yet. register it!
                    var partial = {
                        name: moduleName,
                        //asyncPath:this.asyncMap[moduleName],
                        isAsync:true,
                        isPartial:true //we don't know the dependencies yet, so we have to parse after load to find out.
                    };
                    this._registerModule(partial);
                    result[moduleName] = partial;
//                    }else{
//                        result[moduleName] = undefined;
//                    }
                }

            }
            return result;
        },


        /**
         * Initializes all modules with autoInit metadata flag set to true.
         * @param modules - optional - hash of modules you wish to init
         */
        _initAutoInitModules: function(modules){
            modules = modules || this._modules;
            //log('_initAutoInitModules called for %s modules.', modules);
            for(var moduleName in modules){
                var module = modules[moduleName];
                if(module.autoInit){
                    this._initModule(module);
                }
            }
        },

        /**
         * Evaluates the function as a string and parses the parameters to determine module dependencies.
         * @param func - the function you wish to find dependencies for.
         * @returns {Array} - string array of dependencies. e.g. ['moduleB', 'moduleC']
         */
        _parseFunctionDependencies:function (func){
            var reg = /\((.*)\)/g;
            var funcString = func.toString();
            var matches = reg.exec(funcString);//funcString.match(reg)[0];
            var paramsAsString = matches? matches[1] : '';
            paramsAsString = paramsAsString.replace(/\s/g, '');
            if(paramsAsString == ''){return [];} //issue with [''] used as dependencies
            var dependencies = paramsAsString.split(',');
            return dependencies;
        },

        /**
         * Adds the module to this._modules.
         * e.g. this.modules[module.name] = module
         * If the module is already added, it will not be overridden, unless it is a shim
         * @param module - the module you wish to register.
         */
        _registerModule: function(module){
            log('_registerModule called for module.name %s', module.name);
            //if we're in amd mode we need to modify the current module to add dependencies, etc.
            if(this._modules[module.name] && this._modules[module.name].isPartial){
                //don't just reassign it because it has other references in initModules, etc.
                //TODO: create a copy function for this so we don't miss stuff.
                var partial = this._modules[module.name];
                partial.dependencies = module.dependencies;
                partial.paths = module.paths;
                partial.autoInit = module.autoInit;
                partial.init = module.init;
                partial.context = module.context;
                partial.isPartial = false;
            }
            if(!this._modules[module.name] || module.isShim){ //don't allow a module to be re-registered (protection from overrides)
                this._modules[module.name] = module;
            }
        },

        /**
         * Iterates over the hash of modules and calls _registerModule for each.
         * @param modules - hash of modules you wish to register.
         */
        _registerModules: function (modules){
            if(!modules){return;}
            for(var moduleName in modules){
                var module = modules[moduleName];
                this._registerModule(module);
            }
        },

        /**
         * Creates the module metadata (name, dependencies, etc) for the passed in function
         * This ultimately is used for this._modules.
         * @param func - the function which represents the module
         * @param force - if the func does not have metadata, we don't do anything with it, unless force is true.
         * @returns {{name: *, paths: *, dependencies: *, resolvedDeps: undefined, autoInit: *, init: *, isInitialized: boolean, context: (*|Function|Function|l.jQuery.context|F.context|G.context|Handlebars.AST.PartialNode.context|Handlebars.JavaScriptCompiler.context|context|.Assign.context|string|Code.context|x.context|context|jQuery.context|context|jQuery.context|context)}}
         */
        _createModuleFromFunction: function(modulePartial, force){
            log('_createModuleFromFunction called');
            var func = modulePartial.func;
            var moduleMeta = typeof func.module == 'object' ? func.module : {};
            if(!moduleMeta && !force){ return; }
            var moduleName = moduleMeta.name || modulePartial.name || func.name;//prefer meta name so ns.moduleA = function(){} can work.
            log('creating module from func for module.name: %s', moduleName);
            var module={
                name: moduleName,
                paths: moduleMeta.paths,
                dependencies : this._parseFunctionDependencies(func),
                resolvedDeps: undefined,
                autoInit: moduleMeta.autoInit, //whether the module should be evaluated before any one else asks for it.
                init: func,
                isInitialized: false,
                context: moduleMeta.context
            };
            return module;
        },

        /**
         * Iterates over the passed in array of functions and creates module metadata for each.
         * @param funcArray - array of functions you wish to create modules from
         * @returns {Array}
         */
        _createModulesFromFunctions: function (funcArray){
            var modules = [];
            for(var i=0; i < funcArray.length; ++i){
                var func = funcArray[i];
                var module = this._createModuleFromFunction(func);
                modules.push(module);
            }
            return modules;
        },

        /**
         * Iterates over every function defined in the specified context and determines if it should be considered
         * a module.
         * @param context - context which will be searched for potential module functions
         * @returns {Array} - array of module functions
         */
        _findModuleFunctions: function(context){
            var foundModuleFunctions = [];
            context = context || this.context;
            for(var key in context){ //look through every function in context to see if its a module
                //log('context is ' + context + ' key: ' + key);
                try{//Unsafe JavaScript attempt to access frame with URL
                    var potential = context[key];
                    if(this._isModule(potential, context, key)){ //
                        //do not modify the potential!!!!!! this is all global functions potentially!
                        var modulePartial = {name:key, func:potential}; //todo: allow for existing meta name. function moduleA(){}  moduleA.module={name:'whatever'}
                        foundModuleFunctions.push(modulePartial);
                    }
                }catch(e){
                }
            }
            //log('foundModuleFunctions: ' + foundModuleFunctions);
            return foundModuleFunctions;
        },

        /**
         * Determines whether property from the context is considered a module or not.
         * @param val - the thing we are evaluating and determining if it is a module or not.
         * @param context - the context from which the val came from e.g. window
         * @param key - the name of the context property
         * @returns {boolean} - whether val is a module.
         */
        _isModule: function(val, context, key){
            var isModule = false;
            if(context.hasOwnProperty(key) && typeof val === "function"){
                isModule = true;
            }
            return isModule;
        },

        /**
         * Iterates over each property in config.shim and creates a corresponding module metadata object.
         * Shim modules will have isInitialized set to true, and initResult equal to the export.
         * All shimmed module libs must be loaded!
         * @returns {Array} - module metadata array
         */
        _createModulesFromShim: function(){
            if(!this.shim){return [];}
            var shimModules = [];
            for(var shimName in this.shim){
                var shimEntry = this.shim[shimName];
                var module = this._createModuleFromShim(shimName, shimEntry);
                shimModules.push(module);
            }
            return shimModules;
        },

        /**
         * Creates module metadata based on the shim config entry.
         * Uses eval(shimConfig.exports) to get the initResult
         * Note: eval is faster than new Function http://jsperf.com/eval-vs-new-func
         *
         * @param shimName
         * @param shimConfig
         * @private
         */
        _createModuleFromShim: function(shimName, shimConfig){
            var initResult;
            var isAsync = false;
            if(this.asyncMap && this.asyncMap[shimName]){
                isAsync = true;
            }
            try{
                initResult = eval(shimConfig.exports);
            }catch(e){}
            var module = {
                name: shimName,
                paths: null, //todo?
                dependencies : shimConfig.dependencies,
                initResult: initResult, //result from running init.  WAIT TO DO THIS AS JQUERY MIGHT NOT BE LOADED.
                isInitialized: !!initResult,
                isShim: true,
                shimConfig: shimConfig,
                isAsync: isAsync
            };
            return module;
        },

        /**
         * Finds all module functions in the context, creates metadata for each, and adds the metadata to this._modules.
         */
        _findAndRegisterModules:function (){
            var foundModuleFunctions = this._findModuleFunctions();
            var foundModules = this._createModulesFromFunctions(foundModuleFunctions);
            if(this.shim){
                var shimModules = this._createModulesFromShim();
                foundModules = shimModules.concat(foundModules);//foundModules.concat(shimModules);
            }
            this._registerModules(foundModules);
        }
    };

    /**
     * The modulus.
     * This function represents require and define.
     * If you pass in a named function, it will be defined, and the function will not be executed immediately.
     * If you pass in a unnamed function, it will act as require, and the function will be executed immediately and passed its dependencies.
     */
    function modulus(func, metadata){
        if(metadata){func.module = metadata;}
        var module = modulus.config._createModuleFromFunction({key:func.name, func:func}, true);

        if(func.name){
            modulus.config._registerModule(module);
//            if(module.module && module.module.autoInit){
//                //modulus.config._initModule(module);  add to queue.
//            }
        }else{
            //modulus.config._initModule(module);
            if(!func.module || (func.module && !func.module.autoInit)){  //if autoInit is specified, wait until modulus.init is called.
                modulus.config._initModule(module);
            }
            if(func.module && func.module.autoInit){
                modulus.anonymousInitQueue = modulus.anonymousInitQueue || [];
                modulus.anonymousInitQueue.push(module);
            }
        }

    }
    /**
     * Starting point for modulus.
     * Scans for module functions, creates metadata for each, adds metadata to this._modules, and runs any module functions
     * with metadata autoInit = true.
     */
    modulus.init = function(settings){
        var start = new Date().getTime();
        modulus.config = merge(defaults, settings);
        modulus.config._findAndRegisterModules();
        modulus.config._initAutoInitModules();
        if(modulus.anonymousInitQueue){
            for(var i=0;i<modulus.anonymousInitQueue.length;++i){
                var anonModule = modulus.anonymousInitQueue[i];
                modulus.config._initModule(anonModule);
            }
            modulus.anonymousInitQueue=[];
        }
        var end = new Date().getTime();
        var total = end-start;
        log('modulus initialized in %s ms', total);
    };

    /**
     * Destroys all registered modules. Useful for unit testing
     */
    modulus.reset = function(){
        modulus.config._modules = defaults._modules = {};
    };
    /**
     * Allows you to get module dependencies for the passed in anonymous function.
     * e.g.
     * modulus.require(function (moduleA, moduleB){...});
     * modulus.define(function myModule(moduleX){...});
     * would resolve moduleA and moduleB
     * @param callback
     */
    modulus.require = modulus.define = function(func, metadata){
        return modulus(func, metadata);
    };

    modulus.config = defaults; //allow modulus function to be called before init is called.

    //assign modulus to the global scope.
    modulusContext.m = modulusContext.modulus = modulus;
})(window);