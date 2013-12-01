function moduleA(moduleB){
    //console.log('moduleA has been loaded');
    return {
        prop1: 123,
        moduleB: moduleB
    };    
}

//module meta data
moduleA.module = {
    autoInit: true //we want this module function to be ran without any other module requiring it first.
};