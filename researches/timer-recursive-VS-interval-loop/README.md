
### 下面这两种轮询的实现有什么差别？

```js
var fn = function(){/*some code*/};

// 1) :
setTimeout(function(){
  fn();
  setTimeout(arguments.callee, 200);
}, 200);

// 2):
setInterval(fn, 200);
