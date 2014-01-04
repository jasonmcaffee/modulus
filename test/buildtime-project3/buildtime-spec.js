describe("modulus built project 3", function(){

    it("should render a View, initialized by pageOne.js require call", function(){
        var expectedText = 'Test One View Successfully Rendered HereTestOneView received change event from controller and rendered this';
        var generatedText = $('#testViewDiv').text();
        expect(generatedText).toEqual(expectedText);
    });
});