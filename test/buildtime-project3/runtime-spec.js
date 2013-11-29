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
            'Backbone':'vendor/backbone-1.1.0',
            '_': 'vendor/underscore-1.5.2',
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

    //you can explicitly call require when needed or preferred.
    it("should support a require function which resolves dependencies", function(){
        var callbackExecuted = false;

        modulus.require(function(pageOne){
            callbackExecuted = true;
        });

        expect(callbackExecuted).toEqual(true);
    });
});