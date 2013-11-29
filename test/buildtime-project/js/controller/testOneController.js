function testOneController(core, log, TestOneView, TestOneModel){
    log('testOneController module loaded');
    return {
        action:function(){
            log('testOneController action called');
            this.testOneView = new TestOneView();
            this.testOneView.render();
        }
    };
}