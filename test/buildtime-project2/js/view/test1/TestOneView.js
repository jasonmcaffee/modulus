var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.TestOneView =function(View, $, core, log){
    log('TestOneView module loaded');

    return View.extend({
        el: '#testViewDiv',
        initialize:function(){
            log('TestOneView init called');
            this.model.on('change:renderSomething', function(){
                log('TestOneView received change event from controller');
                $(this.el).append('<div>TestOneView received change event from controller and rendered this</div>');
            }, this);
        },
        render:function(){
            log('TestOneView.render called');
            $(this.el).html('Test One View Successfully Rendered Here');
        }
    });
};