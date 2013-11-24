var moduleCInitCount = 0;
function moduleC(){
    console.log('module moduleC has been loaded');
    return ++moduleCInitCount;
}

moduleC['%'] = true;