function pageOne(global, core, testOneController){
    core.log('pageOne module loaded');
}

pageOne.module = {
    autoInit: true
};
function testOneModel(log, core){
    log('testOneModel module loaded');
    return {
        testOneModel: true
    };
}
function testOneView(Backbone, $, core, testOneModel){
    core.log('testOneView module loaded');

    return {
        testOneView: true
    };
}
function global(core, $){
    core.log('global module loaded');
}
function testOneController(core, testOneView, testOneModel){
    core.log('testOneController module loaded');
    return {

    };
}
