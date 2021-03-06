//i suspect the ajaxFileLoad is interfering with above test.
describe("modulus explicit defines - async", function(){

    var ajaxCount = 0;
    var testCallback;
    modulus.reset();
    modulus.init({
        //we can optionally use our own config to map module names to paths.
        asyncMap:{
            //since jquery is already on the test page, we won't need to load it again.
            'Backbone':'vendor/backbone-1.1.0.min',
            '_': 'vendor/underscore-1.5.2.min'
        },
        asyncFileLoad:function(moduleName, callback, errorback){
            ajaxCount++;
            var root = 'test/explicit-defines/';
            if(moduleName.indexOf('module')>=0){
                moduleName = 'modules/'+moduleName;
            }else{
                moduleName = this.asyncMap[moduleName];
            }

            var path = root+moduleName + '.js';
            $.ajax({
                url: path,
                crossDomain:true, //allow local file system cross domain requests.
                dataType: "script",
                success: function(){
                    if(testCallback){testCallback(ajaxCount);}
                    //random slowdown.
                    setTimeout(function(){

                        callback();
                    }, Math.floor(Math.random()*100));
                }
            }).fail(function(err){errorback(err)});
        }
    });

    it("explicit require: should support async loading of a single module with no dependencies", function(){
        var callbackExecuted = false;
        runs(function(){
            m(['moduleA'], function(modA){
                callbackExecuted = true;
                expect(modA.name).toEqual('moduleA');
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(1);
        });
    });

    it("explicit require: it should not create an ajax request when the module has been loaded already", function(){
        var callbackExecuted = false;
        runs(function(){
            m(['moduleA'], function(modA){
                callbackExecuted = true;
                expect(modA.name).toEqual('moduleA');
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(1);
        });
    });

    it("explicit require: it should download multiple modules at the same time (not wait for one to load before the other) and callback when both are loaded", function(){
        modulus.reset();
        ajaxCount=0;
        var callbackExecuted = false;
        var testCallbackExecuted = false;
        //test callback is fired on ajax success. the count should be 2.
        testCallback = function(count){
            testCallbackExecuted = true;
            expect(count).toEqual(2);
            testCallback = null;
        };

        runs(function(){
            m(['moduleA', 'moduleB'], function(a, b){
                callbackExecuted = true;
                expect(a.name).toEqual('moduleA');
                expect(b.name).toEqual('moduleB');
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(2);
            expect(testCallbackExecuted).toEqual(true);
        });
    });

    //we can't determine dependencies until the module has been loaded.
    it("explict require: it should download a module first, and then its dependencies at the same time", function(){
        modulus.reset();
        ajaxCount=0; var testCallbackCount = 0;
        var callbackExecuted = false;
        var testCallbackExecuted = false;
        //test callback is fired on ajax success. the count should be 2.
        testCallback = function(count){
            ++testCallbackCount;
            if(testCallbackCount == 1){
                //this is allowed to fail because in some browsers (ie9) the module is loaded so quickly its dependencies are loaded in the same call.
                //_initModuleAndDependenciesSimultaneously
                //ajaxFileLoad is called, and by the time you reach if(module.dependencies) the module has been registered and the dependencies are known.
                //expect(count).toEqual(1);  <--
            }
            if(testCallbackCount == 2){
                testCallbackExecuted = true;
                expect(count).toEqual(3);
                testCallback = null;
            }
        };

        runs(function(){
            m(['moduleAandB'], function(modAandB){
                callbackExecuted = true;
                expect(modAandB.moduleA.name).toEqual('moduleA');
                expect(modAandB.moduleB.name).toEqual('moduleB');
            });
        });

        waits(3000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(3);
            expect(testCallbackExecuted).toEqual(true);
        });
    });

    it("explict require: should handle multiple async modules", function(){
        var callbackExecutedCount = 0;
        modulus.reset();
        runs(function(){
            m(['moduleAandB', 'moduleA', 'moduleB'], function(moduleAandB, moduleA, moduleB){
                callbackExecutedCount++;
                expect(moduleAandB.moduleA.name).toEqual('moduleA');
                expect(moduleAandB.moduleB.name).toEqual('moduleB');
                expect(moduleA.name).toEqual('moduleA');
                expect(moduleB.name).toEqual('moduleB');
            });
        });

        waits(3000);

        runs(function(){
            expect(callbackExecutedCount).toEqual(1);
            //expect(ajaxCount).toEqual(3);
        });
    });

});