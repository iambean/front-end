
var fn = function(){sleep(500);},
  delay = 1000;

var t0 = getTime();
  
//1)setTimeout mode:
setTimeout(function(){
  //console.log("Timeout:"， getTime() - t0);
  fn();
  setTimeout(arguments.callee, delay);
}, delay);

//1)setInterval mode:
setInterval(function(){
  //console.log("Interval:", getTime() - t0);
  fn();
}, delay);


//make the engine sleep with the specified time (ms).
function sleep(time){
  var t0 = getTime();
  while(getTime() - t0 < time){ ; }
}

function getTime(){ return Date.now ? Date.now() : +new Date(); }
