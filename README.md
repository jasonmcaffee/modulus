# Modulus
Drop dead simple module definition library.

Modulus simplifies your module definitions by autowiring module function parameters based on the paramater name.
e.g. having a parameter called moduleA in your module function will result in modulus finding moduleA and passing it to your module function.

By ensuring that module names are unique, we can simplify resolving modules, and eliminate the need of worrying about paths, etc.

## Try it out!
You can play with the specs by going [here](https://codio.com/jasonmcaffee/modulus/master/tree/test/spec1.js) and selecting Project -> Fork.

View the test results [here](https://codio.com/jasonmcaffee/modulus/master/preview/test-runtime-project.html)

##Defining Modules
To define a module, simply create a named function:

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
        prop1: moduleA.prop1 + 1
    };
}

```
### But wait, there's more!
Modulus provides several ways of defining modules.

#### via the m function
the m function (aka modulus()) allows you to define and require modules.
This is a good option when you have a large project and are worried about global functions getting overridden.
```javascript
//define by passing in named function
m(function moduleA(){
    return {prop1: 123};
});

//require by passing in non-named function
m(function(moduleA){
    console.log(moduleA.prop1);
});
```

#### via a context object
You can define all of your modules as properties of a context
```javascript
var ns = {};
ns.moduleB = function(){
    return {
        prop1: 123
    };
};

ns.moduleB = function(moduleA){
    return {
        prop1: moduleA.prop1 + 1
    };
};

modulus.init({context:ns});
```

##Start Processing

### Option 1 - module metadata
Each module can have metadata to control behavior of modulus.
By specifying autoInit = true, modulus knows to run the function once it's dependencies have been located.

```javascript
//configure the module to execute without being required by another module first.
moduleB.module = {
    autoInit: true
};

//start processing
modulus.init();
```
### Through the m function
```javascript
//require alias
m(function(moduleB){
    //immediately executed
});
m(function(moduleB){
    //invoked once modulus.init() is called.
}, {autoInit:true});
```

### Through the modulus.require function
```javascript
modulus.require(function (moduleB){
    console.log(moduleB.prop1); //prints 124
});
```

## AMD
Currently the AMD functionality resides in [src/modulus/modulusAsync](src/modulus/modulusAsynch.js)
This will likely be merged with the non async version (src/modulus/modulus.js) soon.

If you wish to asynchronously load modules, you will need to provide an asyncFileLoad function.

Example Project can be found [here](test/async-loading).
[spec](test/async-loading/async-loading-spec.js)
[test page](test-async-loading.html)
### Example Implementation
We can opt to create our own config entry which we can reference during asyncFileLoad.

NOTE: You can create any convention or configuration that you want.  asyncFileLoad's 'this' will be the config object.
```javascript
modulus.init({
    asyncMap:{
        'Controller':'core/mvc/Controller',
        'Model':'core/mvc/Model',
        'View': 'core/mvc/View',
        'log': 'core/util/log',
        'core': 'core/core',
        'global': 'base/global',
        'TestOneModel': 'model/test1/TestOneModel',
        'pageOne': 'page/pageOne',
        '$':'vendor/jquery-1.10.2.min',
        'Backbone':'vendor/backbone-1.1.0.min',
        '_': 'vendor/underscore-1.5.2.min',
        'TestOneView': 'view/test1/TestOneView',
        'testOneController':'controller/testOneController'
    },
    asyncFileLoad:function(moduleName, callback, errorback){
        var root = 'test/buildtime-project3/js/';
        var path = root+this.asyncMap[moduleName] + '.js'; //find the path by referencing the asyncMap
        $.ajax({
            url: path,
            crossDomain:true, //allow local file system cross domain requests.
            dataType: "script",
            success: callback
        }).fail(function(err){errorback(err)});
    }
});
```

### Async Loading Behavior
Modulus attempts to load modules as quickly as possible by using this strategy:

Modulus will attempt to asynchronously load any module that is not currently registered (i.e. in modulus.config._modules) when asyncFileLoad is defined.

When you require a module asynchronously, the module will first be downloaded, and then it's dependencies will be downloaded simultaneously.

Note: this means that the order in which the dependencies are loaded is not guaranteed.

When you require a module that has already been loaded, a new asyncFileLoad request will not be made.

Shim entries that are asynchronously downloaded will have dependencies loaded first. (e.g. Backbone shouldn't be loaded until underscore is)

Shim entry dependencies will be downloaded simultaneously. e.g. if you require Backbone, jquery and underscore will be loaded at the same time.

## Build Time Option
If you choose to use the build time library, you have the option of using file names as module names instead of using the function name.

This is preferred method, and eliminates the possibility of accidental overrides (someone creating two moduleA functions)

### Build Configuration
Every aspect of the modulus build is customizable.  Modulus exposes all functions through the config so you can override any behavior.

#### Buildtime Project Example

An example project that is built by modulus can be found [here](test/buildtime-project).
The spec is also in this folder if you want to modify it.

The grunt task used to build the project via modulus can be found [here](grunt-tasks/test/buildtime-project/build.js).

The buildtime project is built to [this directory](dist/test/buildtime-project)

The test page for the buildtime project can be found [here](test-buildtime-project.html).

You can run the build using:
```
grunt build-buildtime-project
```

```javascript
var modulus = require('modulusjs');

modulus.build({
    //the directory which should be scanned to find modules
    baseDirectory: 'test/buildtime-project/js', //the directory to scan for modules.
    modulePattern: '**/*.js', //glob pattern matching
    dist:{
        files:{
            './dist/test/buildtime-project/pageOne.js':{
                dependencies:['pageOne'], //start at module b and include all it's dependencies.
                excludes:['global'] //todo: for pages that have a global.js and a page.js
            },
            './dist/test/buildtime-project/global.js':{
                dependencies:['global']
            }
        }
    },
    //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
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
NOTE: currently you have to duplicate your shim configuration during runtime via modulus.init({shim:...})  (only needed if you add other 3rd party libs)

## Configuration

### Shim
Third party libraries and other modules which aren't written in the modulus format can still be used, so long as you
provide a shim configuration.

For example, if you wanted to use jquery as a dependency in your modules, you could create a shim:
```javascript
modulus.init({
    shim:{
        '$':{
            dependencies:[],
            exports: '$'
        }
    }
});

function moduleA($){
    var $body = $('body');
}
```
### Special module processing
NOTE: THIS FEATURE IS NOT COMPLETE YET.
Modulus allows you to process your modules at runtime, allowing you to easily build a framework on top of it.

```javascript
function moduleA(moduleB){..}

//optional metadata
moduleA.module = {
    myCustomMetaData : 'widget'
}

//module metadata is passed
modulus.on('registerModule', function(module){
    if(module.myCustomMetaData == 'widget'){
        handleWidgetModule(module);
    }
    if(module.name.indexOf('moduleA') >= 0){
        specialProcessing(module);
    }else if(module.path.indexOf('some/path/to/folder') >= 0){
        specialProcessing(module);
    }else if(module.deps.indexOf('moduleB') >= 0){
        swapDependencies(module, 'moduleB', 'moduleBVersion2');
    }
});
```

##FAQ
### Isn't it dangerous to globally define module functions?
Perhaps, but let's consider a few scenarios.
#### Overridding Module Functions After Init Won't Matter
After modulus.init has been called, it doesn't matter if your module functions have been overridden with new functions.
e.g.
```javascript
function moduleA(){}
modulus.init();
//moduleA is referenced in memory so any changes won't matter.
moduleA = false;
delete moduleA;

modulus.require(function(moduleA){..});
```

#### What about accidentally overridding 3rd party functions
You can load your third party libs after modules have been registered.
e.g.
```javascript
//define your modules first
function $(){} //uh oh
modulus.register();
//jquery code
(function(){jquery stuff})()
modulus.init();
```
####I'm still scared
You can also prefix your module names
```javascript
function $moduleA($moduleB){}
function $moduleB(){}
```
#### But I don't like global functions!
Fine
```javascript
var namespace ={};
namespace.moduleA = function(moduleB){};
namespace.moduleB = function(){};

modulus.init({context: namespace});
```

### I want my own module syntax!
All functions in modulus are granular and overridable, which means you can define your modules in any way you see fit.
```javascript
modulus.init({
   /**
    * Iterates over every function defined in the specified context and determines if it should be considered
    * a module.
    * @param context - context which will be searched for potential module functions
    * @returns {Array} - array of module functions
    */
   _findModuleFunctions: function(context){
        //any custom logic you want to find your module functions
        return [array, of, functions];
   }
});
```

## Build time API
### Install
```
npm install modulusjs
```
### Build
Take a look at the [grunt-tasks/test](grunt-tasks/test) dir for modulus build usages.
```javascript
var modulus = require('modulusjs');
modulus.build({
    ...
}, buildComplete, buildFailure);
```
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
grunt build
```
##Release Notes
### 0.0.1
In progress.
* Runtime configuration - basic poc of functionality working and shown on codio.
* Build configuration - basic functionality shown with grunt test-commonjs-module and src/modules.







