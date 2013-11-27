describe("modulus", function(){
    modulus.init();

    //you can explicitly call require when needed or preferred.
    it("should support a require function which resolves dependencies", function(){
        var callbackExecuted = false;
        
        modulus.require(function(moduleA, moduleB, moduleC){
            callbackExecuted = true;
            expect(moduleA.prop1).toEqual(123);
            expect(moduleA.moduleB).toEqual(moduleB);
            expect(moduleB.b).toEqual('this i b');
            expect(moduleC).toEqual(1);
            expect(moduleB.moduleC).toEqual(moduleC);
        });
        
        expect(callbackExecuted).toEqual(true);
    });
    
    it("should only call a module's init once", function(){
        modulus.require(function(moduleC){
            expect(moduleC).toEqual(1);    
        });
        
        modulus.require(function(moduleC){
            expect(moduleC).toEqual(1);    
        }); 
    });
});

describe("modulus - internal", function(){
    it("should find modulus modules declared in the global scope", function(){
        expect(modulus.config._modules.moduleA.initResult.prop1).toEqual(123);
        expect(modulus.config._modules.moduleB.initResult.b).toEqual('this i b');
    });

    it("should ensure that modules get their dependencies via params to module function", function(){
        expect(modulus.config._modules.moduleA.initResult.moduleB).toEqual(modulus.config._modules.moduleB.initResult);
    });
});