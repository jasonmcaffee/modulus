function pageOne(a,b,c){b.log("pageOne module loaded"),c.action()}function TestOneModel(a,b){a("testOneModel module loaded");var c=b.extend({});return c}function TestOneView(a,b,c,d){return d("TestOneView module loaded"),a.extend({el:"#testViewDiv",initialize:function(){d("TestOneView init called"),this.model.on("change:renderSomething",function(){d("TestOneView received change event from controller"),b(this.el).append("<div>TestOneView received change event from controller and rendered this</div>")},this)},render:function(){d("TestOneView.render called"),b(this.el).html("Test One View Successfully Rendered Here")}})}function testOneController(a,b,c,d){return b("testOneController module loaded"),{action:function(){b("testOneController action called"),this.testOneModel=new d,this.testOneView=new c({model:this.testOneModel}),this.testOneView.render(),this.testOneModel.set({renderSomething:!0})}}}pageOne.module={autoInit:!0},pageOne.module.name="pageOne",pageOne.module.deps=["global","core","testOneController"],TestOneModel.module={name:"TestOneModel",deps:["log","Model"]},TestOneView.module={name:"TestOneView",deps:["View","$","core","log"]},testOneController.module={name:"testOneController",deps:["core","log","TestOneView","TestOneModel"]};