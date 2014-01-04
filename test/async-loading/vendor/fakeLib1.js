var fakeWindow = fakeWindow || {};//ie8 cant delete window properties, and that interferes with unit test resets.
fakeWindow.fakeLib1 = 1;  //needs to be on window so i can delete during testing.