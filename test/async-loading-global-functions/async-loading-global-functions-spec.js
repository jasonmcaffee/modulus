
//i suspect the ajaxFileLoad is interfering with above test.
describe("modulus async modules global functions", function(){

    var ajaxCount = 0;
    var testCallback;
    modulus.reset();
    modulus.init({
        context: window,//we must supply a context for global function modules
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
        //we can optionally use our own config to map module names to paths.
        asyncMap:{
             //since jquery is already on the test page, we won't need to load it again.
             'Backbone':'vendor/backbone-1.1.0.min',
             '_': 'vendor/underscore-1.5.2.min'
        },
        asyncFileLoad:function(moduleName, callback, errorback){
            ajaxCount++;
            var root = 'test/async-loading-global-functions/';
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
        moduleA = moduleB = window.moduleA = window.moduleB = null;
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

    it("should handle multiple async modules", function(){
        var callbackExecutedCount = 0;
        modulus.reset();
        runs(function(){
            m(function(moduleAandB, moduleA, moduleB){
                callbackExecutedCount++;
                expect(moduleAandB.moduleA.name).toEqual('moduleA');
                expect(moduleAandB.moduleB.name).toEqual('moduleB');
            });
        });

        waits(3000);

        runs(function(){
            expect(callbackExecutedCount).toEqual(1);
            //expect(ajaxCount).toEqual(3);
        });
    });

});

var fakeWindow = fakeWindow || {};//ie8 cant delete props from window.
describe("modulus async shims", function(){
    var ajaxCount = 0;
    var testCallback;

    beforeEach(function(){
        ajaxCount = 0;
        testCallback = null;
        modulus.reset();
        //we have to delete as modulus iterates of object properties, and doesn't care about the value (undefineds are allowed).
        //if the property name exists, modulus assumes it doesn't need to be loaded.
        //issues in ie8
        //http://perfectionkills.com/understanding-delete/#ie_bugs
        try{delete fakeWindow.fakeLib2and3;}catch(e){}
        try{delete fakeWindow.fakeLib1and2and3and4;}catch(e){}
        try{delete fakeWindow.fakeLib1;}catch(e){}
        try{delete fakeWindow.fakeLib2;}catch(e){}
        try{delete fakeWindow.fakeLib3;}catch(e){}
        try{delete fakeWindow.fakeLib4; }catch(e){}
        try{delete fakeWindow._;  }catch(e){}
        try{delete fakeWindow.Backbone; }catch(e){}


        modulus.init({
            _shimContext: fakeWindow,//fix for ie8 bug not being able to delete window.prop
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
                },
                'fakeLib1':{
                    dependencies:[],
                    exports:'fakeLib1'
                },
                'fakeLib2':{
                    dependencies:[],
                    exports:'fakeLib2'
                },
                'fakeLib3':{
                    dependencies:[],
                    exports:'fakeLib3'
                },
                'fakeLib4':{
                    dependencies:[],
                    exports:'fakeLib4'
                },
                'fakeLib2and3':{
                    dependencies:['fakeLib2', 'fakeLib3'],
                    exports:'fakeLib2and3'
                },
                'fakeLib1and2and3and4':{
                    dependencies:['fakeLib1', 'fakeLib2', 'fakeLib3', 'fakeLib4'],
                    exports:'fakeLib1and2and3and4'
                }

            },
            asyncMap:{
                'Backbone':'vendor/backbone-1.1.0.min',
                '_': 'vendor/underscore-1.5.2.min'
            },
            asyncFileLoad:function(moduleName, callback, errorback){
                ajaxCount++;
                var root = 'test/async-loading/';
                if(moduleName.indexOf('module')>=0){
                    moduleName = 'modules/'+moduleName;
                }else if(moduleName.indexOf('fakeLib')>=0){
                    moduleName = 'vendor/'+moduleName;
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
                        }, Math.floor(Math.random()*500));
                    }
                }).fail(function(err){errorback(err)});
            }
        });
    });


   it("should support async loading of a single shim with no dependencies", function(){
        var callbackExecuted = false;
        runs(function(){
            m(function(fakeLib1){
                callbackExecuted = true;
                expect(fakeLib1).toEqual(1);
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(1);
        });
    });

    it("it should not create an ajax request when the shim has been loaded already", function(){
        var callbackExecuted = false;
        runs(function(){
            m(function(fakeLib1){
                expect(fakeLib1).toEqual(1);
            });
        });

        waits(1000);
        runs(function(){
            m(function(fakeLib1){
                callbackExecuted = true;
                expect(fakeLib1).toEqual(1);
            });
        });
        waits(50);
        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(1);
        });
    });

    it("it should download multiple shims simultaneously and callback when both are loaded", function(){
        var callbackExecuted = false;
        var testCallbackExecuted = false;
        //test callback is fired on ajax success. the count should be 2.
        testCallback = function(count){
            testCallbackExecuted = true;
            expect(count).toEqual(2);
            testCallback = null;
        };

        runs(function(){
            m(function(fakeLib1, fakeLib2){
                callbackExecuted = true;
                expect(fakeLib1).toEqual(1);
                expect(fakeLib2).toEqual(2);
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(2);
            expect(testCallbackExecuted).toEqual(true);
        });
    });


    it("it should download a shim, then download it's dependencies at the same time (when they don't have dependencies)", function(){
        var callbackExecuted = false;
        var testCallbackExecuted = false;
        var testCallbackCount = 0;
        //test callback is fired on ajax success. the count should be 2.
        testCallback = function(count){
            ++testCallbackCount;

            if(testCallbackCount == 1){
                expect(count).toEqual(2);
            }
            if(testCallbackCount == 2){
                expect(count).toEqual(2); //still waiting for dependencies to load.
            }
            if(testCallbackCount == 3){
                expect(count).toEqual(3);
                testCallbackExecuted = true;
                testCallback = null;
            }

        };

        runs(function(){
            m(function(fakeLib2and3){
                callbackExecuted = true;
                expect(fakeLib2and3).toEqual(5);
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
            expect(ajaxCount).toEqual(3);
            expect(testCallbackExecuted).toEqual(true);
        });
    });

    it("should handle several requests for async shims and make the minimal number of async requests to load them", function(){
        var callbackExecutedCount = 0;

        runs(function(){
            m(function(fakeLib3, fakeLib2and3, fakeLib2, fakeLib1and2and3and4, fakeLib1, fakeLib4){
                callbackExecutedCount++;
                expect(fakeLib2and3).toEqual(5);
                expect(fakeLib2).toEqual(2);
                expect(fakeLib1).toEqual(1);
                expect(fakeLib1and2and3and4).toEqual(10);
                expect(fakeLib4).toEqual(4);
            });
        });

        waits(1000);

        runs(function(){
            expect(callbackExecutedCount).toEqual(1);
            expect(ajaxCount).toEqual(6);
        });

    });

    it("should handle loading real 3rd party libraries which are shimmed", function(){
        var callbackCount = 0;
        runs(function(){
            m(function(_){
                callbackCount++;
                expect(_.VERSION).toEqual('1.5.2');
            });
        });
        waits(1000);
        runs(function(){
            expect(callbackCount).toEqual(1);
        });
    });

    it("should handle loading real 3rd party libraries which are shimmed and have dependencies", function(){
        var callbackCount = 0;
        runs(function(){
            m(function(Backbone){
                callbackCount++;
                expect(Backbone.VERSION).toEqual('1.1.0');
            });
        });
        waits(1000);
        runs(function(){
            expect(callbackCount).toEqual(1);
        });
    });

});