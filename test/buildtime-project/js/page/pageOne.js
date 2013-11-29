function pageOne(global, core, testOneController){
    core.log('pageOne module loaded');
    testOneController.action();
}
//start this module when modulus init is called.
pageOne.module = {
    autoInit: true
};