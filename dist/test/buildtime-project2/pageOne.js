var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.TestOneModel =function(log, Model){
    log('testOneModel module loaded');
    var TestOneModel = Model.extend({

    });
    return TestOneModel;
};
;ns.TestOneModel.module = {name:"TestOneModel", deps:["log","Model"]};
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
;ns.TestOneView.module = {name:"TestOneView", deps:["View","$","core","log"]};
var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.testOneController = function(core, log, TestOneView, TestOneModel){
    log('testOneController module loaded');
    return {
        action:function(){
            log('testOneController action called');

            this.testOneModel = new TestOneModel();
            this.testOneView = new TestOneView({model:this.testOneModel});

            //render to the testOneDiv
            this.testOneView.render();

            //trigger a model change which the view listens for and renders to the page again.
            this.testOneModel.set({renderSomething:true});
        }
    };
};
;ns.testOneController.module = {name:"testOneController", deps:["core","log","TestOneView","TestOneModel"]};
var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.pageOne = function(global, core, testOneController){
    core.log('pageOne module loaded');
    testOneController.action();
}
//start this module when modulus init is called.
ns.pageOne.module = {
    autoInit: true
};
;ns.pageOne.module.name = "pageOne";
ns.pageOne.module.deps = ["global","core","testOneController"];
