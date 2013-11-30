describe("modulus", function(){
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
            'Controller':'core/mvc/Controller',
            'Model':'core/mvc/Model',
            'View': 'core/mvc/View',
            'log': 'core/util/log',
            'core': 'core/core',
            'global': 'base/global',
            'TestOneModel': 'model/test1/TestOneModel',
            'pageOne': 'page/pageOne',
            '$':'vendor/jquery-1.10.2.min',
            'Backbone':'vendor/backbone-1.1.0.min',
            '_': 'vendor/underscore-1.5.2.min',
            'TestOneView': 'view/test1/TestOneView',
            'testOneController':'controller/testOneController'
        },
        asyncFileLoad:function(moduleName, callback, errorback){
            var root = 'test/buildtime-project3/js/';
            var path = root+this.asyncMap[moduleName] + '.js';
            $.ajax({
                url: path,
                crossDomain:true, //allow local file system cross domain requests.
                dataType: "script",
                success: callback
            }).fail(function(err){errorback(err)});
        }
    });

    xit("should support async loading of a single module with no dependencies", function(){
        var callbackExecuted = false;
        runs(function(){
            m(function(_){
                callbackExecuted = true;
                expect(_.VERSION).toEqual('1.5.2');
            });
        });

        waits(5000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
        });
    });

    it("should support async loading of a single module which has async dependencies", function(){
        var callbackExecuted = false;
        runs(function(){
            m(function(Backbone){
                callbackExecuted = true;
                expect(Backbone.VERSION).toEqual('1.1.0');
            });
        });

        waits(5000);

        runs(function(){
            expect(callbackExecuted).toEqual(true);
        });
    });
});