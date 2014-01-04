describe("modulus", function(){
    modulus.init({
        context: window //when using global functions to define our modules, we must provide a context to scan for the functions
    });

    //you can explicitly call require when needed or preferred.
    it("should render a View, initialized by pageOne.js require call", function(){
        var expectedText = 'Test One View Successfully Rendered HereTestOneView received change event from controller and rendered this';
        var generatedText = $('#testViewDiv').text();
        expect(generatedText).toEqual(expectedText);
    });

//    it("should only call a module's init once", function(){
//        modulus.init();
//        modulus.require(function(moduleC){
//            expect(moduleC).toEqual(2); //since we call init again, count is 2 at this point
//        });
//
//        modulus.require(function(moduleC){
//            expect(moduleC).toEqual(2);
//        });
//    });

//    it("should support shimming third party libraries", function(){
//        var callbackExecuted = false;
//        modulus.init({
//            shim:{
//                '$':{
//                    dependencies:[],
//                    exports: '$'
//                }
//            }
//        });
//
//        modulus.require(function($){
//            callbackExecuted = true;
//            expect($.fn.jquery).toEqual('1.10.2');
//        });
//
//        expect(callbackExecuted).toEqual(true);
//    });
});

//describe("modulus - internal", function(){
//    it("should find modulus modules declared in the global scope", function(){
//        expect(modulus.config._modules.moduleA.initResult.prop1).toEqual(123);
//        expect(modulus.config._modules.moduleB.initResult.b).toEqual('this i b');
//    });
//
//    it("should ensure that modules get their dependencies via params to module function", function(){
//        expect(modulus.config._modules.moduleA.initResult.moduleB).toEqual(modulus.config._modules.moduleB.initResult);
//    });
//});