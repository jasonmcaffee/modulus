var ns=ns || {};//each module must do this when using the context/namespace option of modulus.
ns.Model = function (log, Backbone){
    log('Model module loaded');
    var Model = Backbone.Model.extend({

    });
    return Model;
};