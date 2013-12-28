m('moduleAandB', ['moduleA', 'moduleB'], function doesntMatter(sameOrder, asDefinedInDepsArray){
    console.log('moduleAandB module loaded');
    return {
        moduleA: sameOrder,
        moduleB: asDefinedInDepsArray
    }
});