function modulus(){

}
function log(){
    console.log.apply(console, arguments);
}
modulus.config = function(){
    log('modulus.config called');
};

modulus.build = function(){
    console.log('modulus build called.');
};


module.exports = modulus;
