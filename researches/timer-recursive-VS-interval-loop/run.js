
var delay = 1000;

var t0 = getTime();
  
//1)setTimeout mode:
setTimeout(function(){
  console.log("1) timeout:", getTime() - t0);
  sleep(500);
  setTimeout(arguments.callee, delay);
}, delay);

//2)setInterval mode:
setInterval(function(){
  console.log("2) interval:", getTime() - t0);
  sleep(500);
}, delay);


//make the engine sleep with the specified time (ms).
function sleep(time){
  var t0 = getTime();
  while(getTime() - t0 < time){ ; }
}

//get timestamp.
function getTime(){ return Date.now ? Date.now() : +new Date(); }
