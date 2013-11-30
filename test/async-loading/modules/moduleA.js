console.log('file loaded moduleA');
m(function moduleA(){
    console.log('moduleA module loaded');
    return {
        name: 'moduleA'
    }
});