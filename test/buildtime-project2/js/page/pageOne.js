var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.pageOne = function(global, core, testOneController){
    core.log('pageOne module loaded');
    testOneController.action();
}
//start this module when modulus init is called.
ns.pageOne.module = {
    autoInit: true
};