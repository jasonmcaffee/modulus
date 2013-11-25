var moduleCInitCount = 0;
/*
* comments and stuff
*
*/
function moduleC(){
    console.log('module moduleC has been loaded');
    return ++moduleCInitCount;
}

moduleC['%'] = true;