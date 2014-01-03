var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.TestOneModel =function(log, Model){
    log('testOneModel module loaded');
    var TestOneModel = Model.extend({

    });
    return TestOneModel;
};