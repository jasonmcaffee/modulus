var fakeWindow = fakeWindow || {};//ie8 cant delete window properties, and that interferes with unit test resets.
fakeWindow.fakeLib2and3 = fakeWindow.fakeLib2 + fakeWindow.fakeLib3;