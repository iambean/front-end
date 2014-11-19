
##### Here is the following code, what is the diffrence betwin this 2 implementations?

```js
var fn = function(){/*some code*/};

// 1) :
setTimeout(function(){
  fn();
  setTimeout(arguments.callee, 200);
}, 200);

// 2):
setInterval(fn, 200);
