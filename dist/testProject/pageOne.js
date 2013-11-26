function pageOne(global, core, testOneController){
    core.log('pageOne module loaded');
}

pageOne.module = {
    autoInit: true
};
function global(core){
    core.log('global module loaded');
}
function testOneController(core, testOneView, testOneModel){
    core.log('testOneController module loaded');
    return {

    };
}
function core(log){
    log('core module loaded');

    var core = {
        log: log
    };

    return core;
}
function log(){
    var log = function(){
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }
    }

    return log;
}
function testOneModel(log, core){
    log('testOneModel module loaded');
    return {
        testOneModel: true
    };
}
function testOneView(core, testOneModel){
    core.log('testOneView module loaded');

    return {
        testOneView: true
    };
}
