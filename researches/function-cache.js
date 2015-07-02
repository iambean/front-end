/**
 * @desc 函数体挂载缓存
 * @author mbn.bean@gmail.com
 */
(function(){
  console.log(typeof f1, typeof f2);//undefined, undefined
  var f1 = function f2(){
    console.log(f1===f2, f2===arguments.callee, f1===arguments.callee);//true, true; but IE...
    !f2.cache && (f2.cache = {
      attr : "function's cache."
    });
  }
  f1();
  console.log(typeof f1, typeof f2);//function, undefined
  console.log(f1.cache.attr);//"function's cache."
})();
