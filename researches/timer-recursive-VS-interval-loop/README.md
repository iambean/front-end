
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


假设fn函数执行所需的用时为x(ms)，那么：
1）setTimeout的方式下，执行轮询的理论间隔时间 = (200 + x) ms

2）setInterval的方式下，执行轮询的理论间隔时间 = Math.max(200, x) ms
