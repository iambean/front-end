
var fn = function(){sleep(500);},
  delay = 1000;
  
//1)setTimeout mode:
setTimeout(function(){
  fn();
  setTimeout(arguments.callee, delay);
}, delay);

//1)setInterval mode:
setInterval(fn, delay);


//make the engine sleep with the specified time (ms).
function sleep(time){
  var t0 = getTime();
  while(getTime() - t0 < time){ ; }
  var getTime = function(){ return Date.now ? Date.now() : +new Date(); }
}
