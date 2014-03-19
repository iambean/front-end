

不依赖Flash，原生HTML+JS实现自定义UI的跨浏览器的文件上传组件。

#######

原本是很简单的直接用dom代理的方式，将<input type="file"../>的元素(后称"上传button")隐藏，
在自定义UI的button（后称"UI button"）上绑定click事件，调用上传button的 change()，呼出选择本地文件的系统窗口，
但是ie9+由于安全策略，在客户端js里不允许对文件上传控件的代理调用，于是改变策略：

###
将UI button的同级 clone一个出来，同时新建一个div容器，将
