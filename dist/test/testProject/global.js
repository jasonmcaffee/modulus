function global(core, $){
    core.log('global module loaded');
}
function log(){
    var log = function(){
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }
    }

    return log;
}
function core(log){
    log('core module loaded');

    var core = {
        log: log
    };

    return core;
}
