describe("modulus project 2", function(){
    //when assigning module functions to a context/namespace, we must provide modulus a reference to the context, and start processing
    //via the init function.
    m.init({context:ns});

    it("should render a View, initialized by pageOne.js require call", function(){
        var expectedText = 'Test One View Successfully Rendered HereTestOneView received change event from controller and rendered this';
        var generatedText = $('#testViewDiv').text();
        expect(generatedText).toEqual(expectedText);
    });
});