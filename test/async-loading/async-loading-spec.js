describe("modulus", function(){
    var ajaxCount = 0;
    var testCallback;
    modulus.init({
        //any modules you want to include that aren't modulus compliant. e.g. myModule($) would get the result of this path
        shim:{
            '$':{
                dependencies:[],
                exports:'$'
            },
            'Backbone':{
                dependencies: ['_', '$'],
                exports:'Backbone'
            },
            '_':{
                dependencies: [],
                exports:'_'
            }
        },
        asyncMap:{
//            'Controller':'core/mvc/Controller',
//            'Model':'core/mvc/Model',
//            'View': 'core/mvc/View',
//            'log': 'core/util/log',
//            'core': 'core/core',
//            'global': 'base/global',
//            'TestOneModel': 'model/test1/TestOneModel',
//            'pageOne': 'page/pageOne',
//            '$':'vendor/jquery-1.10.2.min',
//            'Backbone':'vendor/backbone-1.1.0.min',
//            '_': 'vendor/underscore-1.5.2.min',
//            'TestOneView': 'view/test1/TestOneView',
//            'testOneController':'controller/testOneController'
        },
        asyncFileLoad:function(moduleName, callback, errorback){
            ajaxCount++;
            var root = 'test/async-loading/';
            if(moduleName.indexOf('module')>=0){
                moduleName = 'modules/'+moduleName
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
                    }, Math.floor(Math.random()*500));
                }
            }).fail(function(err){errorback(err)});
        }
    });

    it("should support async loading of a single module with no dependencies", function(){
        var callbackExecuted = false;
        runs(function(){
            m(function(moduleA){
                callbackExecuted = true;
                expect(moduleA.name).toEqual('moduleA');
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(1);
        });
    });

    it("it should not create an ajax request when the module has been loaded already", function(){
        var callbackExecuted = false;
        runs(function(){
            m(function(moduleA){
                callbackExecuted = true;
                expect(moduleA.name).toEqual('moduleA');
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(1);
        });
    });

    it("it should download multiple modules at the same time (not wait for one to load before the other) and callback when both are loaded", function(){
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
            m(function(moduleA, moduleB){
                callbackExecuted = true;
                expect(moduleA.name).toEqual('moduleA');
                expect(moduleB.name).toEqual('moduleB');
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
    it("it should download a module first, and then its dependencies at the same time", function(){
        modulus.reset();
        ajaxCount=0; var testCallbackCount = 0;
        var callbackExecuted = false;
        var testCallbackExecuted = false;
        //test callback is fired on ajax success. the count should be 2.
        testCallback = function(count){
            ++testCallbackCount;
            if(testCallbackCount == 1){
                expect(count).toEqual(1);
            }
            if(testCallbackCount == 2){
                testCallbackExecuted = true;
                expect(count).toEqual(3);
                testCallback = null;
            }
        };

        runs(function(){
            m(function(moduleAandB){
                callbackExecuted = true;
                expect(moduleAandB.moduleA.name).toEqual('moduleA');
                expect(moduleAandB.moduleB.name).toEqual('moduleB');
            });
        });

        waits(3000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(3);
            expect(testCallbackExecuted).toEqual(true);
        });
    });

});