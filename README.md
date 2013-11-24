# Modulus
Drop dead simple module definition library.

Modulus simplifies your module definitions by autowiring module function parameters based on the paramater name.
e.g. having a parameter called moduleA in your module function will result in modulus finding moduleA and passing it to your module function.

By ensuring that module names are unique, we can simplify resolving modules, and eliminate the need of worrying about paths, etc.

## Try it out!
You can play with the specs by going [here](https://codio.com/jasonmcaffee/modulus/master/tree/test/spec1.js) and selecting Project -> Fork.

View the test results [here](https://codio.com/jasonmcaffee/modulus/master/preview/test.html)

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

## Build Time Option

## Configuration
### Special module processing
Modulus allows you to process your modules at runtime:

```javascript
function moduleA(moduleB){..}

//optional metadata
moduleA.module = {
    myCustomMetaData = 'widget'
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





