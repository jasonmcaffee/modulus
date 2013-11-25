function log(){
    var log = function(){
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }
    }

    return log;
}