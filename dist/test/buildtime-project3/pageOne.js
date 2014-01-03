m("TestOneModel",["log","Model"], function TestOneModel(log, Model){
    log('testOneModel module loaded');
    var TestOneModel = Model.extend({

    });
    return TestOneModel;
});
m("TestOneView",["View","$","core","log"], function TestOneView(View, $, core, log){
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
});
m("testOneController",["core","log","TestOneView","TestOneModel"], function testOneController(core, log, TestOneView, TestOneModel){
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
});
m(["global","core","testOneController"], function (global, core, testOneController){
    core.log('pageOne module loaded');
    testOneController.action();
});

