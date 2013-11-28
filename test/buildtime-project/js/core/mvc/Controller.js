function Controller(core){
    core.log('Controller module loaded');
    function Controller(){
        core.log('creating new instance of Controller');
    }

    Controller.prototype ={
        action: function(){
            core.log('Controller action called');
        }
    };
    return Controller;
}