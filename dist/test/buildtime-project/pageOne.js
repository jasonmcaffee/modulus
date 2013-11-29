function pageOne(global, core, testOneController){
    core.log('pageOne module loaded');
    testOneController.action();
}
//start this module when modulus init is called.
pageOne.module = {
    autoInit: true
};
function TestOneModel(log, Model){
    log('testOneModel module loaded');
    var TestOneModel = Model.extend({

    });
    return TestOneModel;
}
function testOneView(Backbone, $, core, log){
    log('testOneView module loaded');

    return {
        testOneView: true
    };
}
function global(core, $){
    core.log('global module loaded');
}
function testOneController(core, TestOneView, TestOneModel){
    core.log('testOneController module loaded');
    return {
        action:function(){

        }
    };
}
