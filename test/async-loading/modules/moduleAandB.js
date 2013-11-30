console.log('file loaded moduleAandB');
m(function moduleAandB(moduleA, moduleB){
    console.log('moduleAandB module loaded');
    return {
        moduleA: moduleA,
        moduleB: moduleB
    }
});