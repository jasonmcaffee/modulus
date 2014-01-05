describe("modulus buildtime project", function(){
    modulus.init({
        context: window //when using global functions to define our modules, we must provide a context to scan for the functions
    });

    it("should work", function(){

    });
    //you can explicitly call require when needed or preferred.
    it("should render a View, initialized by pageOne.js require call", function(){
        var expectedText = 'Test One View Successfully Rendered HereTestOneView received change event from controller and rendered this';
        var generatedText = $('#testViewDiv').text();
        expect(generatedText).toEqual(expectedText);
    });
});