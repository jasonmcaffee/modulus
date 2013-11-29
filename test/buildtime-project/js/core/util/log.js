function log(){
    var log = function(){
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }
    }
    log('log module loaded');
    return log;
}