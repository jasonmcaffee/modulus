console.log('file loaded moduleAandB');
function moduleAandB(moduleA, moduleB){
    console.log('moduleAandB module loaded');
    return {
        moduleA: moduleA,
        moduleB: moduleB
    }
}