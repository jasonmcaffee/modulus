function TestOneView(View, $, core, log){
    log('TestOneView module loaded');

    return View.extend({
        el: '#testViewDiv',
        render:function(){
            log('TestOneView.render called');
            $(this.el).html('Test One View Successfully Rendered Here');
        }
    });
}