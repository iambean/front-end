/**
 * @title: 判断用户的滑动方向是水平还是垂直方向的。
 * @desc: 取起始点和第一次move的点坐标计算X轴夹角，
 *      若是大于指定的临界值crossover(默认20°)则认为是垂直方向，否则是水平方向的。
 *      这里只针对触摸设备的单指滑动操作。
 */
function slideDirection(cfg) {
    var dom = cfg.dom,//判断滑动方向的容器
        crossover = (cfg.crossover * 1) || 20,//判断方向的临界值（与X轴夹角度数的绝对值）
        callback = cfg.callback,//判断完成后的回调函数
        isMob = ("ontouchstart" in document);
    if(!isMob){
        return false;
    }
    //在捕获阶段绑定事件，尽早触发
    dom.addEventListener("touchstart", function(e) {
        e = e.touches[0];
        var point = {
            x: e.pageX,
            y: e.pageY
        };
        this.addEventListener("touchmove", _move, true);
        this.addEventListener("touchend",   _end, true);
        this.addEventListener("touchcancel", _end, true);

        function _move(e){
            e.preventDefault();
          	e.stopPropagation();
            e = e.touches[0];
            var deltaX = e.pageX - point.x,
                deltaY = e.pageY - point.y,
                degree = (Math.atan(Math.abs(deltaY / deltaX)) * 180) / Math.PI;
            callback(degree < crossover ? "h" : "v");
            //每次完整的滑动流程中，保证move只执行一次。
            dom.removeEventListener("touchmove", _move, true);
        }
        function _end(){
            dom.removeEventListener("touchend", _end, true);
            dom.removeEventListener("touchcancel", _end, true);
        }

    }, true);
}

//e.g:
slideDirection({
    dom : document.querySelector("#wrapper"),
    crossover : 25,
    callback : function(direct){
        if(direct==="h"){
            console.log("horizontal slide");
            //...
        }else if(direct==="v"){
            console.log("vertical slide");
            //...
        }
    }
});

/*****************************************************************************************/
/**
 * @desc 函数体挂载缓存
 */
(function(){
  console.log(typeof f1, typeof f2);//undefined, undefined
        var f1 = function f2(){
              console.log(f1===f2, f2===arguments.callee);//true, true; but IE...
                !f2.cache && (f2.cache = {
                        attr : "function's cache."
                });
        }
        f1();
        console.log(typeof f1, typeof f2);//function, undefined
          console.log(f1.cache.attr);//"function's cache."
})();
