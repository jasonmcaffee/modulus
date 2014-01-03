var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.core = function(log, Model, View, Controller){
    log('core module loaded');

    var core = {
        log: log
    };

    return core;
};