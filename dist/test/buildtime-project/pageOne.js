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
function TestOneView(View, $, core, log){
    log('TestOneView module loaded');

    return View.extend({
        render:function(){

        }
    });
}
function global(core, $){
    core.log('global module loaded');
}
function testOneController(core, log, TestOneView, TestOneModel){
    log('testOneController module loaded');
    return {
        action:function(){
            log('testOneController action called');
        }
    };
}
