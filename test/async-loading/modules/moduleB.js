console.log('file loaded moduleB');
m(function moduleB(){
    console.log('moduleB module loaded');
    return {
        name: 'moduleB'
    }
});