function moduleD(){   //moduleB circular dependencies are not allowed.
    console.log('moduleD module loaded');

    return {
        moduleD: true
    };
}

moduleD.module = true;