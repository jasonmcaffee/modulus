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

        /**
         * Iterates over the hash of modules, passing each to _initModule so the module and its dependencies can be initialized.
         * @param modules - object hash with name on the left and metadata on the right. e.g. {'moduleA': {name:'moduleA', ...}, 'moduleB': {...} }
         * @returns {Array} - array of results from the init. (needed to pass results into module.init.apply)
         */
        _initModules:function(modules){
            var moduleInitResults = [];
            modules = modules || this._modules;
            log('_initModules called for %s modules.', modules);
            for(var moduleName in modules){
                var module = modules[moduleName];
                this._initModule(module);
                moduleInitResults.push(module.initResult);
            }
            return moduleInitResults;
        },

        /**
         * Runs the module function for the passed in module if the function has not been ran before (module.isInitialized == false)
         * Runs the init for any dependency modules if they have not been initialized
         * Assigns the result of the function to module.initResult.
         *
         * @param module - the module you wish to init.
         * @returns {*} - the result of module();
         */
        _initModule: function giveContext(module){
            log('init called for module.name: %s', module.name);
            //if the module has already been initialized, return it's result
            if(module.isInitialized){ return module.initResult; }
            try{
                var resolvedDependencies = [];
                //retrieve module metadata for the dependencies
                if(module.dependencies && module.dependencies.length > 0){
                    var modules = this._getModules(module.dependencies);
                    log('module.name: %s depends on modules %s', module.name, module.dependencies);

                    //init all dependencies
                    resolvedDependencies = this._initModules(modules);//make sure all dependencies are initialized.
                }
                //run the module init
                module.initResult = module.init.apply(undefined, resolvedDependencies);
                module.isInitialized = true;
            }catch(e){
                var errorMessage = 'modulus: error initializing module.name: ' + (module.name || 'anonymous' )+ '\n error:'; //+ ' \n error: ' + e
                console.error(errorMessage);
                e.message = errorMessage + e.message;
                throw e; //do not swallow exceptions! if there's any error in the module init, we need to let it propogate.
            }

            return module.initResult;
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
         * @param module - the module you wish to register.
         */
        _registerModule: function(module){
            log('_registerModule called for module.name %s', module.name);
            if(!this._modules[module.name]){ //don't allow a module to be re-registered (protection from overrides)
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
        _createModuleFromFunction: function(func, force){
            log('_createModuleFromFunction called');
            var moduleMeta = typeof func.module == 'object' ? func.module : {};
            if(!moduleMeta && !force){ return; }
            var moduleName = moduleMeta.name || func.name;//explict overrides allowed. default is to use the function name.
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
                        foundModuleFunctions.push(potential);
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
            var module = {
                 name: shimName,
                 paths: null, //todo?
                 dependencies : shimConfig.dependencies,
                 initResult: eval(shimConfig.exports), //result from running init
                 isInitialized: true
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
                foundModules = foundModules.concat(shimModules);
            }
            this._registerModules(foundModules);
        }
    };

    /**
     * The modulus.
     */
    var modulus = {
        /**
         * Starting point for modulus.
         * Scans for module functions, creates metadata for each, adds metadata to this._modules, and runs any module functions
         * with metadata autoInit = true.
         */
        init:function(settings){
            var start = new Date().getTime();
            this.config = merge(defaults, settings);
            this.config._findAndRegisterModules();
            this.config._initAutoInitModules();
            var end = new Date().getTime();
            var total = end -start;
            log('modulus initialized in %s ms', total);
        },

        /**
         * Optional function which should be used with start, and not used with init.
         * Useful if you are being cautious of overriding third party global variables.
         * @param settings - optional configuration
         */
        register:function(settings){
            this.config = merge(defaults, settings);
            this.config._findAndRegisterModules();
        },

        /**
         * Optional function which should be used with start, and not used with init.
         * Useful if you are being cautious of overriding third party global variables.
         * @param settings - optional configuration which will get merged with the current this.config
         */
        start:function(settings){
            this.config = merge(this.config, settings);
            this.config._initAutoInitModules();
        },
        /**
         * Allows you to get module dependencies for the passed in anonymous function.
         * e.g.
         * modulus.require(function (moduleA, moduleB){...});
         * would resolve moduleA and moduleB
         * @param callback
         */
        require:function(callback){
            var module = this.config._createModuleFromFunction(callback, true);
            this.config._initModule(module);
        }
    };

    //assign modulus to the global scope.
    modulusContext.modulus = modulus;
})(window);