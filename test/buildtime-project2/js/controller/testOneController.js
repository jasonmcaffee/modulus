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