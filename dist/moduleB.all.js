//comments
function moduleB(moduleC, moduleD){
    console.log('moduleB has been loaded');
    return {
        b: 'this i b',
        moduleC: moduleC
    };    
}

//module meta data
moduleB['%']=true;
var moduleCInitCount = 0;
/*
* comments and stuff
*
*/
function moduleC(moduleD){
    console.log('module moduleC has been loaded');
    return ++moduleCInitCount;
}

moduleC['%'] = true;
function moduleD(){   //moduleB circular dependencies are not allowed.
    console.log('moduleD module loaded');

    return {
        moduleD: true
    };
}
