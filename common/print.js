/**
 * 在客户端的webview里面打log
 */
log: function (str, color) {
	if(typeof str !== "string"){
		str = JSON.stringify(str);
	}
	var logger = document.getElementById("pallasPageLogger"),
		closer = null,
		content = null;
	if(!logger){
		var logger = document.createElement("div");
		logger.id = "pallasPageLogger";
		logger.style.cssText = "position:fixed;top:100px;left:10px;width:60%;z-index:99999;border:1px dashed red;background-color:#EEE;min-height: 20px;";
		logger.innerHTML = '<span class="closer"></span><div class="content"></div>';
		document.body.appendChild(logger);

		closer = logger.getElementsByTagName("span")[0];
		content = logger.getElementsByTagName("div")[0];

		closer.style.cssText = "background: url(http://ico.ooopic.com/iconset01/ginux/64/53924.png) 0 0 no-repeat; background-size: 100%; position: absolute; display: block; right: -10px; top: -10px; width: 20px;height: 20px;cursor:pointer;";
		content.style.cssText = "background-color:#EEE;cursor:move;word-break:break-all;";

		closer.onclick = function(){
			content.innerHTML = "";
		};

		//简单的拖动实现：
		var Drag = function(ele){
			this.node = ele;
			this.node.style.position = "absolute"
			this.node.me = this;//保存自身的引用
			this.node.onmousedown = this.dragstart;//监听mousedown事件
		};

		Drag.prototype = {
			constructor:Drag,
			dragstart:function(e){
				var e = e || window.event,//获得事件对象
					self = this.me,//获得拖动对象
					node = self.node;//获得拖动元素
				//鼠标光标相对于事件源对象的坐标
				node.offset_x = e.clientX - node.offsetLeft;
				node.offset_y = e.clientY - node.offsetTop;
				node.onmousemove = self.drag;//监听mousemove事件
				node.onmouseup = self.dragend;//监听mouseup事件
			},
			drag:function(e){
				var e = e || window.event,//获得事件对象
					self = this.me,//获得拖动对象
					node = self.node;//获得拖动元素
				node.style.cursor = "move";
				//将拖动的距离加再在原先的left与top上，以实现位移
				!+"\v1"? document.selection.empty() : window.getSelection().removeAllRanges();
				node.style.left = e.clientX - node.offset_x  + "px";
				node.style.top = e.clientY - node.offset_y  + "px";
				node.onmouseup = self.dragend;//监听mouseup事件
			},
			dragend:function(){
				var self = this.me,//获得拖动对象
					node = self.node;//获得拖动元素
				node.onmousemove = null;
				node.onmouseup = null;
			}
		};
		// init it.
		new Drag(logger);
	}
	content = logger.getElementsByTagName("div")[0];
	str = this.HTML.encode(str);
	content.innerHTML += (color ? ('<span style="background-color:'+ color +'">' + str + '</span>') : str )+"<hr/>";
}
