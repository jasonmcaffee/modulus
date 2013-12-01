var moduleCInitCount = 0;
/*
* comments and stuff
*
*/
function moduleC(moduleD){
    //console.log('module moduleC has been loaded');
    return ++moduleCInitCount;
}