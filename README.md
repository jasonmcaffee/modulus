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

### Option 2
```javascript
modulus.init();

modulus.require(function (moduleB){
    console.log(moduleB.prop1); //prints 124
});
```

## AMD
No AMD support yet, but it'll probably look something like:
```javascript
function moduleA(asynchModuleB){
}
moduleA.module = {
    params:{
        asynchModuleB: 'http://www.example.com/js/moduleB.js'
    }
}
```
or
```javascript
modulus.config({
    paths:{
        'asynchModuleB':'http://www.example.com/js/moduleB.js'
    }
});
```

You will probably also have to supply the async function:
```javascript
modulus.config({
     asynchFileLoad: function(path, callback, errorback){
         $.ajax({
             url: path,
             dataType: "script",
             success: callback
          }).fail(function(err){erroback(err)});
     });
});
```

## Build Time Option
If you choose to use the build time library, you have the option of using file names as module names instead of using the function name.

This is preferred method, and eliminates the possibility of accidental overrides (someone creating two moduleA functions)

### Build Configuration
Every aspect of the modulus build is customizable.  Modulus exposes all functions through the config so you can override any behavior.

#### Simple Example
```javascript
var modulus = require('modulusjs');

modulus.build({
    //the directory which should be scanned to find modules
    baseDirectory: 'testProject/js', //the directory to scan for modules.
    modulePattern: '**/*.js', //glob pattern matching

    //build distributions
    dist:{
        files:{
            './dist/testProject/pageOne.js':{
                dependencies:['pageOne'], //start at module b and include all it's dependencies.
            }
        }
    },
    //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
    shim:{
        '$':{
            path: 'src/vendor/jquery-1.9.1.js',
            dependencies:[],
            exports:'$'
        }
    }

}, buildComplete, buildError);
```

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

#### But I don't like global functions!
Fine
```javascript
var namespace ={};
namespace.moduleA = function(moduleB){};
namespace.moduleB = function(){};

modulus.init({context: namespace});
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







