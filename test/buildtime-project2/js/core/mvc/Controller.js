var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.Controller = function(log){
    log('Controller module loaded');
    function Controller(){
        core.log('creating new instance of Controller');
    }

    Controller.prototype ={
        action: function(){
            core.log('Controller action called');
        }
    };
    return Controller;
};