# Modulus.js

[http://modulusjs.org](http://modulusjs.org)

# Overview

Modulus provides your javascript application with a Service Locator that allows you to easily register and locate other modules.

Modulus simplifies your module definitions by autowiring module function parameters based on the paramater name.
e.g. having a parameter called moduleA in your module function will result in modulus finding moduleA and passing it to your module function.
By ensuring that module names are unique, we can simplify resolving modules, and eliminate the need of worrying about paths, etc.

## Service Locator

Modulus is a [Service Locator][2], in that it provides a central place to register your modules, and a means to find modules from within other modules.
More specifically, Modulus is a [Dynamic Service Locator][3], as services are registered and found at runtime.

## AMD Loader

Modulus provides the ability to intelligently* load module dependencies/scripts during runtime.

## Node.js Build Tool/Script Optimizer

You can compile your modules into one or more script files to optimize the number of http requests made at runtime.

# API

## Defining Modules

There are several options for defining modules with Modulus.

### Modulus Function

Modulus provides a simplified version of the typical 'define' and 'require' functions found in other AMD libraries.
To do the equivalent of define, simply pass in a named function to the 'm' or 'modulus' function.
To do the equivalent of require, simply pass in a unnamed function to the 'm' or 'modulus' function.
Modulus can parse the function name and parameters, thus reducing the amount of boilerplate code you need to write.

```javascript


                    //define a module named 'moduleA' by passing in a named function.
                    m(function moduleA(){
                        return {
                            prop1: 123
                        };
                    });

                    //require moduleA by passing in a unnamed function with a parameter named moduleA
                    m(function (moduleA){
                        console.log(moduleA.prop1); //prints 123
                    });


```

### Modulus Function - Explicit Define and Require

You can also opt to use a requirejs-like api, and explicitly define and require modules.
Although, this api is primarily used by the modulus build when protectAgainstMinification is true (default).
Since minifiers rename parameter names and remove function names, modulus provides an API which accepts a string for the module name, and an array of string names for the dependencies.

```javascript


                    //define a module named 'moduleA' by passing in a named function.
                    m('moduleA', ['dep1'], function moduleA(dep1){
                        return {
                            prop1: 123
                        };
                    });

                    //require moduleA by passing in a unnamed function with a parameter named moduleA
                    m(['moduleA'], function (moduleA){
                        console.log(moduleA.prop1); //prints 123
                    });


```

### Global Module Functions

In perhaps the easiest way possible, Modulus allows you to define modules with global functions.
Any dependencies on other modules are simply identified via parameter names, where the parameter name matches the name of the desired module.

```javascript


                    //defining a module is as simple as creating a function.
                    function moduleA(){
                        return {
                            prop1: 123
                        };
                    }

                    //simply by referencing moduleA, you will get its return value passed in as the parameter value.
                    function moduleB(moduleA){
                        return {
                            prop1: moduleA.prop1 %2B 1 //evaluates to 124
                        };
                    }

                    //let modulus know to execute moduleB once init has been called.
                    moduleB.module = {autoInit:true};

                    //the use of global functions means that we must explicitly call init.
                    modulus.init({context:window});


```

When using this option for defining modules, we must explicitly call 'init' so that modulus can scan the context for modules.
We must also provide module metadata (via moduleB.module), and instruct Modulus to run the moduleB function once init has been called.

### Context Object

You can also choose to assign modules to a namespace/context object.

```javascript


                    var ns = {};
                    ns.moduleB = function(){
                        return {
                            prop1: 123
                        };
                    };

                    ns.moduleB = function(moduleA){
                        return {
                            prop1: moduleA.prop1 %2B 1
                        };
                    };

                    modulus.init({context:ns});


```

## Runtime Configuration

Modulus offers a powerful configuration that allows you to override any function within the Modulus, allowing you to completely customize behavior.
Configuration is achieved by calling the 'init' function, and passing in an object literal with the desired settings.

### Shim for 3rd Party Libraries

To shim third party libraries which do not use the Modulus convention for defining modules, we can provide a shim configuration.
NOTE: You do not need to specify a runtime shim config if you've specified one in your build configuration.

```javascript


                //shim configuration for a few common libraries.
                modulus.init({
                    shim:{
                        //define the jquery shim. The key '$' represents the parameter name modules will use to require jquery.
                        //the exports represents the global variable the third party library exposes.
                        '$':{
                            dependencies:[],
                            exports:'$'
                        },
                        '_':{
                            dependencies: [],
                            exports:'_'
                        },
                        //Backbone depends on 2 other 3rd party libraries: jquery and underscore.
                        //We must list those as dependencies so that they are loaded before Backbone is.
                        'Backbone':{
                            dependencies: ['_', '$'],
                            exports:'Backbone'
                        }
                    }
                });

                m(function ($, Backbone){
                    $('#someId');
                    console.log(Backbone.VERSION);
                });



```

### AMD

The Modulus AMD API is completely customizable, allowing you to determine any convention or configuration you'd like.
To get started, you'll first need to provide a 'asyncFileLoad' function.

```javascript


                m.init({
                    //When a module is requested that is not found, and an asyncFileLoad function is provided, asyncFileLoad
                    //will be called so that the module can be loaded.
                    asyncFileLoad:function(moduleName, callback, errorback){
                        var root = 'js/';                       //custom convention
                        moduleName = this.asyncMap[moduleName]; //custom convention

                        var path = root%2BmoduleName %2B '.js';
                        $.ajax({
                            url: path,
                            crossDomain:true, //allow local file system cross domain requests.
                            dataType: "script",
                            success: callback
                        }).fail(function(err){errorback(err)});
                    },
                    //custom configuration entry to help locate modules. (You can create your own convention or configuration)
                    asyncMap:{
                        moduleA:'moduleA'
                    }
                });


```

#### AMD Loading Behavior

Modulus attempts to load modules as quickly as possible by using this strategy:
Modulus will attempt to asynchronously load any module that is not currently registered (i.e. in modulus.config._modules) when asyncFileLoad is defined.
When you require a module asynchronously, the module will first be downloaded, and then it's dependencies will be downloaded simultaneously.
Note: this means that the order in which the dependencies are loaded is not guaranteed.
When you require a module that has already been loaded, a new asyncFileLoad request will not be made.
Shim entries that are asynchronously downloaded will have dependencies loaded first. (e.g. Backbone shouldn't be loaded until underscore is)
Shim entry dependencies will be downloaded simultaneously. e.g. if you require Backbone, jquery and underscore will be loaded at the same time.


# Build Tool/Script Optimization

Modulus offers a powerful node.js module to help you optimize your project's script files into one (or more) js files.
Every aspect of the modulus build is customizable. Modulus exposes all functions through the config so you can override any behavior.
The build tool's primary function is finding module dependencies and combining modules together into 1 or more js files.
This helps in optimizing your web application, as it results in fewer http requests.

## Install

```

npm install modulusjs

```

## Build

```javascript


                var modulus = require('modulusjs');
                modulus.build({
                    ...
                }, buildComplete, buildFailure);


```

## Build Configuration

### Shim

Any scripts which do not follow the modulus convention for registering modules (e.g. third party libs) can be shimmed.
Shimming allows us to reference these third party libs as we would any other module in modulus.
When a shim is specified for the build configuration, modulus will generate and append a call to modulus which specifies the module's name, dependencies, and a function which returns the global export of the library.

#### Example: Generated Modulus Function Call for jQuery

```javascript


                (function jquerySrcCode(){...})();

                //generated modulus function call for jquery shim
                m('$', [], function(){ return $;});


```

### Example Build Configuration

```javascript


                modulus.build({
                    //the directory which should be scanned to find modules.
                    //baseDirectory is combined with modulePattern to form a glob pattern, which finds all modules in the project.
                    baseDirectory: 'test/buildtime-project/js', //the directory to scan for modules.
                    modulePattern: '**/*.js', //glob pattern matching

                    //modulus typically depends on function names and param names to resolve dependencies and register modules.
                    //since minifiers can rename params, as well as remove function names, we can ensure modulus still functions
                    //by rewriting the modulus function calls to use the expicit define api.
                    //e.g. m(function myModule(dep1){...}); gets rewritten to m('myModule', ['dep1'], function(dep1){...});
                    protectAgainstMinification: true,

                    //the dist configuration tells Modulus which files to combine together, and where to put the combined file(s).
                    dist:{
                        //in this example, we demonstrate building 2 optimized files: 'global.js' and 'pageOne.js'.
                        //global.js is placed on each page, and a page.js file should not include any modules found
                        //in global (avoid redundancy)
                        files:{
                            //tell Modulus to build a pageOne.js file and distribute it to our dist directory.
                            //in our source directory, there is a pageOne.js that starts the dependency chain.
                            //modulus will find pageOne's dependencies, and all the dependencies of those dependencies, etc,
                            //until all dependencies are found.
                            //Once all dependencies are found, pageOne.js is written to the dist directory,
                            //and will include all dependencies.
                            './dist/test/buildtime-project/pageOne.js':{
                                dependencies:['pageOne'], //start at module b and include all it's dependencies.
                                //any modules that are defined in global should not be defined in pageOne.
                                //e.g. jquery and other core modules.
                                excludes:['global']
                            },
                            './dist/test/buildtime-project/global.js':{
                                dependencies:['global']
                            }
                        }
                    },
                    //any modules you want to include that aren't modulus compliant.
                    //e.g. myModule($) would get the result of this path
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


```

### Build Guidelines

Only one module per js file is allowed

The name of the file without the extension is used as the name of the module when resolving dependencies during build.

### Protecting Against Minification

Minifiers will rewrite param names and in some cases remove the names of functions. To avoid issues with minification, the build process will rewrite module definitions to use strings to explicitly define a module.

#### Explicit Define when using the Modulus Function

```javascript


                //original
                m(function myModule(dependency1, dependency2){...})
                //becomes
                m('myModule', ['dependency1', 'dependency2'], function myModule(dependency1, dependency2){...})


```

#### Explicit Define when using Global Functions

```javascript


                //original
                function myModule(dependency1, dependency2){...}
                //will get this added
                myModule.module = {name: 'myModule', deps:['dependency1', 'dependency2']};


```

#### Explicit Define when Assigning Modules to a Context

```javascript


                //original
                var ns = {};
                ns.myModule = function (dependency1, dependency2){...}
                //will get this added
                ns.myModule.module = {name: 'myModule', deps:['dependency1', 'dependency2']};


```

#### Nested Requires

Modulus will also rewrite nested requires, since they can be affected by minification.

```javascript


                //original
                m(function myModule(dependency1, dependency2){
                    return {
                        //download a module/script only when needed (nested require dependencies are not included in the build)
                        nestedRequire: function(){
                            //original
                            m(function(someModule){...});
                            //becomes
                            m(['someModule'], function(someModule){...});
                        }
                    };
                });
                //becomes
                m('myModule', ['dependency1', 'dependency2'], function myModule(dependency1, dependency2){...})


```

# Try It Out

## Codio

You can play with the specs by going [here][4] and selecting Project -> Fork.
View the test results [here][5]

# Download

Modulus is still in Alpha.
For now, please refer to the [Github page][6] for download instructions.

# Open Source

Modulus is an open source project, and can be found on [Github][6].

## License

[The MIT License (MIT)][7]
Copyright (c) 2013 Jason McAffee

   [1]: http://modulusjs.org/img/header.png
   [2]: http://en.wikipedia.org/wiki/Service_locator_pattern
   [3]: http://martinfowler.com/articles/injection.html
   [4]: https://codio.com/jasonmcaffee/modulus/master/tree/test/spec1.js
   [5]: https://codio.com/jasonmcaffee/modulus/master/preview/test-runtime-project.html
   [6]: https://github.com/jasonmcaffee/modulus
   [7]: http://opensource.org/licenses/MIT


##Contribute!
Feel free to work on any open [issues](https://github.com/jasonmcaffee/modulus/issues)
Setup is super simple.

###Setup
```shell
git clone https://github.com/jasonmcaffee/modulus.git
cd modulus
npm install
sudo npm install grunt-cli@0.1.9 -g
```
###Build
```shell
#build test projects
grunt build-test
```
##Release Notes
### 0.0.8
* Better reorder of modules. modules now ordered in dependency order (least dependend on top). A module's dependencies will always be before the module. (not always needed, but good for requires)
* Generating and appending shim functions. e.g. m('$', [], function(){ return $;}  is added when jquery is shimmed.

### 0.0.7
* Explicit require api. e.g. m(['dep1', 'dep2'], function(dep1, dep2){...});

### 0.0.6
* protection against minification for all modulus usage options.
* Explicit define api. e.g. m('moduleName', ['dep1', 'dep2'], function moduleName(dep1, dep2){...});

### 0.0.5
* several issues fixed.

### 0.0.1 through 0.0.4
In progress.
* Runtime configuration - basic poc of functionality working and shown on codio.
* Build configuration - basic functionality shown with grunt test-commonjs-module and src/modules.
* Runtime API for namespaced module registration, global module functions, and modulus function calls.







