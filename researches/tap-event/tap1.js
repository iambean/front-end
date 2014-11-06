
/**
 * Simple implementation.
 * document.querySelector("button").tap(function(e){
 *    console.log(e, this);
 * });
 */

HTMLElement.prototype.tap = function(fn, bCapture){
  var dom = this;
  if ("ontouchstart" in document) {
    dom.addEventListener("touchstart", function(e) {
      var _ = false;
      
      dom.addEventListener("touchmove", onMove, bCapture);
      
      dom.addEventListener("touchend", function(e) {
        !_ && (fn.call(this, e));
        dom.removeEventListener("touchmove", onMove, bCapture);
        dom.removeEventListener("touchend", arguments.callee, bCapture);
      }, bCapture);
      
      function onMove() {
          _ = true;
      }
    }, bCapture);
  } else {
    dom.addEventListener("click", fn, !! bCapture);
  }
  return this;
}

