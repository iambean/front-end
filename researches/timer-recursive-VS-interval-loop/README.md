
### setTimeout做轮询和setInterval的区别

```js
var fn = function(){/*some code*/};

// 1) :
setTimeout(function(){
  fn();
  setTimeout(arguments.callee, 200);
}, 200);

// 2):
setInterval(fn, 200);
```

假设fn函数执行所需的用时为x(ms)，那么：
- setTimeout的方式下，执行轮询的理论间隔时间 = (200 + x) ms
- setInterval的方式下，执行轮询的理论间隔时间 = Math.max(200, x) ms
