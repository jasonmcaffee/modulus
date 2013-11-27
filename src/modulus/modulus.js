(function(modulusContext){
    var modulus = {
        _modules: {
//             'moduleX':{
//                 name: moduleMeta.name,
//                 paths: moduleMeta.paths,
//                 deps : this._parseFunctionDependencies(func),
//                 autoInit: moduleMeta.autoInit,
//                 init: func,
//                 initResult: undefined, //result from running init
//                 isInitted: false,
//                 context: moduleMeta.context //the 'this' for the module init
//             }
        },

        /**
         * Runs the module function for the passed in module if the function has not been ran before (module.isInitted == false)
         * Runs the init for any dependency modules if they have not been initialized
         * Assigns the result of the function to module.initResult.
         *
         * @param module - the module you wish to init.
         * @returns {*} - the result of module();
         */
        _initModule: function giveContext(module){
            console.log('init called for module.name: %s', module.name);
            //if the module has already been initialized, return it's result
            if(module.isInitted){ return module.initResult; }
            try{
                var modules = this._getModules(module.deps);
                console.log('module.name: %s depends on modules %s', module.name, module.deps);
                var resolvedDependencies = this._initModules(modules);//make sure all deps are initted.
                module.initResult = module.init.apply(undefined, resolvedDependencies);
                module.isInitted = true;
            }catch(e){
                console.error('error initting module.name: %s \n error: %s', module.name, e);                
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
         * Iterates over the hash of modules, passing each to _initModule so the module and its dependencies can be initialized.
         * @param modules - object hash with name on the left and metadata on the right. e.g. {'moduleA': {name:'moduleA', ...}, 'moduleB': {...} }
         * @returns {Array} - array of results from the init. TODO: is this needed?
         */
        _initModules:function(modules){
            var moduleInitResults = [];
            modules = modules || this._modules;
            console.log('_initModules called for %s modules.', modules);
            for(var moduleName in modules){
                var module = modules[moduleName];
                this._initModule(module);
                moduleInitResults.push(module.initResult);
            }
            return moduleInitResults;
        },

        /**
         * Initializes all modules with autoInit metadata flag set to true.
         * @param modules - optional - hash of modules you wish to init
         */
        _initAutoInitModules: function(modules){
            modules = modules || this._modules;
            console.log('_initAutoInitModules called for %s modules.', modules);
            for(var moduleName in modules){
                var module = modules[moduleName];
                this._initModule(module);
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
            var deps = paramsAsString.split(',');
            return deps;
        },

        /**
         * Adds the module to this._modules.
         * e.g. this.modules[module.name] = module
         * @param module - the module you wish to register.
         */
        _registerModule: function(module){
            console.log('_registerModule called for module.name %s', module.name);
            this._modules[module.name] = module;
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
         * @returns {{name: *, paths: *, deps: *, resolvedDeps: undefined, autoInit: *, init: *, isInitted: boolean, context: (*|Function|Function|l.jQuery.context|F.context|G.context|Handlebars.AST.PartialNode.context|Handlebars.JavaScriptCompiler.context|context|.Assign.context|string|Code.context|x.context|context|jQuery.context|context|jQuery.context|context)}}
         */
        _createModuleFromFunction: function(func, force){
            console.log('_createModuleFromFunction called');
            var moduleMeta = typeof func.module == 'object' ? func.module : {};
            if(!moduleMeta && !force){ return; }
            var moduleName = moduleMeta.name || func.name;//explict overrides allowed. default is to use the function name.
            console.log('creating module from func for module.name: %s', moduleName);
            var module={
                name: moduleName, 
                paths: moduleMeta.paths,
                deps : this._parseFunctionDependencies(func),
                resolvedDeps: undefined,
                autoInit: moduleMeta.autoInit, //whether the module should be evaluated before any one else asks for it.
                init: func,
                isInitted: false,
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
         * a module. Currently this requires the function have a 'module' property assigned to it, but that may change.
         * @param context - context which will be searched for potential module functions
         * @returns {Array} - array of module functions
         */
        _findModuleFunctions: function(context){
            var foundModuleFunctions = [];
            context = context || modulusContext;
            for(var key in context){ //look through every function in context to see if its a module
                if(context.hasOwnProperty(key)){
                    //log('context is ' + context + ' key: ' + key);
                    try{//Unsafe JavaScript attempt to access frame with URL
                        var potential = context[key];
                        if(typeof potential === "function" && potential.module){ //
                            foundModuleFunctions.push(potential);        
                        }
                    }catch(e){
                    }
                }
            }
            console.log('foundModuleFunctions: ' + foundModuleFunctions);
            return foundModuleFunctions;
        },

        /**
         * Finds all module functions in the context, creates metadata for each, and adds the metadata to this._modules.
         */
        _findAndRegisterModules:function (){
            var foundModuleFunctions = this._findModuleFunctions();
            var foundModules = this._createModulesFromFunctions(foundModuleFunctions);
            this._registerModules(foundModules);
        },

        /**
         * Starting point for modulus.
         * Scans for module functions, creates metadata for each, adds metadata to this._modules, and runs any module functions
         * with metadata autoInit = true.
         */
        init:function(){
            this._findAndRegisterModules();
            this._initAutoInitModules();
        },

        /**
         * Allows you to get module dependencies for the passed in anonymous function.
         * e.g.
         * modulus.require(function (moduleA, moduleB){...});
         * would resolve moduleA and moduleB
         * @param callback
         */
        require:function(callback){
            var module = this._createModuleFromFunction(callback, true);
            this._initModule(module);
        }
    };
    
    modulusContext.modulus = modulus;
})(window);