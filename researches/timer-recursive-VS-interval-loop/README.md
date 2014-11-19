
Here is the following code, what the diffrence betwin this 2 implementations?

-code
var fn = function(){/\*some code\*/};

// 1) :
setTimeout(function(){
  fn();
  setTimeout(arguments.callee, 200);
}, 200);

// 2):
setInterval(fn, 200);
