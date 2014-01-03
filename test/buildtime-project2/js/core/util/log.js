var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.log =function(){
    var log = function(){
        if(window.console && window.console.log){
            console.log.apply(console, arguments);
        }
    }
    log('log module loaded');
    return log;
};