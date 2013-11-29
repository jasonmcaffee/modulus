ns.pageOne = function(global, core, testOneController){
    core.log('pageOne module loaded');
    testOneController.action();
}
//start this module when modulus init is called.
ns.pageOne.module = {
    autoInit: true
};