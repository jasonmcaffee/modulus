(function(modulusContext){
    var modulus = {
        modules: {
//             'moduleX':{
//                 name: moduleMeta.name,
//                 paths: moduleMeta.paths,
//                 deps : this.parseFunctionDependencies(func),
//                 autoInit: moduleMeta.autoInit,
//                 init: func,
//                 initResult: undefined, //result from running init
//                 isInitted: false,
//                 context: moduleMeta.context //the 'this' for the module init
//             }
        },
        
        initModule: function giveContext(module){
            console.log('init called for module.name: %s', module.name);
            //if the module has already been initialized, return it's result
            if(module.isInitted){ return module.initResult; }
            try{
                var modules = this.getModules(module.deps);
                console.log('module.name: %s depends on modules %s', module.name, module.deps);
                var resolvedDependencies = this.initModules(modules);//make sure all deps are initted.
                module.initResult = module.init.apply(undefined, resolvedDependencies);
                module.isInitted = true;
            }catch(e){
                console.error('error initting module.name: %s \n error: %s', module.name, e);                
            }
            
            return module.initResult;
        },
        
        getModules: function(arrayOfModuleNames){
            var result = {
                //'moduleX': {}    
            };
            for(var i=0; i < arrayOfModuleNames.length; ++i){
                var moduleName = arrayOfModuleNames[i];
                var module = this.modules[moduleName];
                if(module){
                    result[module.name] = module;    
                }
                
            }
            return result;
        },
        
        initModules:function(modules){
            var moduleInitResults = [];
            modules = modules || this.modules;
            console.log('initModules called for %s modules.', modules);
            for(var moduleName in modules){
                var module = modules[moduleName];
                this.initModule(module);
                moduleInitResults.push(module.initResult);
            }
            return moduleInitResults;
        },
        
        initAutoInitModules: function(modules){
            modules = modules || this.modules;
            console.log('initAutoInitModules called for %s modules.', modules);
            for(var moduleName in modules){
                var module = modules[moduleName];
                this.initModule(module);
            }    
        },
        parseFunctionDependencies:function (func){
            var reg = /\((.*)\)/g;
            var funcString = func.toString();
            var matches = reg.exec(funcString);//funcString.match(reg)[0];
            var paramsAsString = matches? matches[1] : '';
            paramsAsString = paramsAsString.replace(/\s/g, '');
            var deps = paramsAsString.split(',');
            return deps;
        },
    
        registerModule: function(module){
            console.log('registerModule called for module.name %s', module.name);
            this.modules[module.name] = module;
        },
        
        registerModules: function (modules){
            if(!modules){return;}
            for(var moduleName in modules){
                var module = modules[moduleName];
                this.registerModule(module);
            }    
        },
        
        createModuleFromFunction: function(func, force){
            console.log('createModuleFromFunction called');
            var moduleMeta = typeof func.module == 'object' ? func.module : {};
            if(!moduleMeta && !force){ return; }
            var moduleName = moduleMeta.name || func.name;//explict overrides allowed. default is to use the function name.
            console.log('creating module from func for module.name: %s', moduleName);
            var module={
                name: moduleName, 
                paths: moduleMeta.paths,
                deps : this.parseFunctionDependencies(func),
                resolvedDeps: undefined,
                autoInit: moduleMeta.autoInit, //whether the module should be evaluated before any one else asks for it.
                init: func,
                isInitted: false,
                context: moduleMeta.context
            };
            return module;
        },
        
        createModulesFromFunctions: function (funcArray){
            var modules = [];
            for(var i=0; i < funcArray.length; ++i){
                var func = funcArray[i];
                var module = this.createModuleFromFunction(func);
                modules.push(module);
            }
            return modules;
        },
        
        
        
        //searches every function in the context
        findModuleFunctions: function(context){
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
        
        findAndRegisterModules:function (){
            var foundModuleFunctions = this.findModuleFunctions();
            var foundModules = this.createModulesFromFunctions(foundModuleFunctions);
            this.registerModules(foundModules);
        },
        init:function(){
            this.findAndRegisterModules();
            this.initAutoInitModules();
        },
        //either array or single string
        require:function(callback){
            var module = this.createModuleFromFunction(callback, true);
            this.initModule(module); 
        }
    };
    
    modulusContext.modulus = modulus;
})(window);