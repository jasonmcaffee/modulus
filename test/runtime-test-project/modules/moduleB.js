//comments
function moduleB(moduleC, moduleD){
    console.log('moduleB has been loaded');
    return {
        b: 'this i b',
        moduleC: moduleC
    };    
}

//module meta data
moduleB.module=true;