var ns ={}; //since global is first, it defines the ns object.
ns.global = function(core, Backbone){
    core.log('global module loaded');
};