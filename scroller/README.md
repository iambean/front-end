## 自定义滚动条

+ 应用场景仅限于需要做IE兼容，因为非IE浏览器上，都可以自定义滚动条高宽/颜色等属性。
+ 这里是相对静态的滚动条，无法想系统滚动条那样能监听到区域内元素的变化，当发生变化时需要手动调用scroller.refresh(); 有个HTML5 API `MutationObserver` 可供参考，但是IE的兼容性并不好，所以没有使用。
+ 参考：https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
