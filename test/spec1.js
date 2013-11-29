describe("modulus", function(){


    //you can explicitly call require when needed or preferred.
    it("should support a require function which resolves dependencies", function(){
        var callbackExecuted = false;
        modulus.init();
        modulus.require(function anon(moduleA, moduleB, moduleC){
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
        modulus.init();
        modulus.require(function(moduleC){
            expect(moduleC).toEqual(2); //since we call init again, count is 2 at this point
        });
        
        modulus.require(function(moduleC){
            expect(moduleC).toEqual(2);
        }); 
    });

    it("should support shimming third party libraries", function(){
        var callbackExecuted = false;
        modulus.init({
            shim:{
                '$':{
                    dependencies:[],
                    exports: '$'
                }
            }
        });

        modulus.require(function($){
            callbackExecuted = true;
            expect($.fn.jquery).toEqual('1.10.2');
        });

        expect(callbackExecuted).toEqual(true);
    });

    it("should not retain old configurations when init is called", function(){
        var count = 0, wasCalled = false;
        function shouldNotBeCalledMoreThanOnce(){
            wasCalled = true;
            expect(++count).toEqual(1);
        }

        modulus.init({
            _findAndRegisterModules:function (){
                shouldNotBeCalledMoreThanOnce();
                var foundModuleFunctions = this._findModuleFunctions();
                var foundModules = this._createModulesFromFunctions(foundModuleFunctions);
                if(this.shim){
                    var shimModules = this._createModulesFromShim();
                    foundModules = shimModules.concat(foundModules);//foundModules.concat(shimModules);
                }
                this._registerModules(foundModules);
            }
        });

        modulus.init({});

        expect(wasCalled).toEqual(true);
        expect(count).toEqual(1);
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