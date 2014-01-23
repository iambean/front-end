/**
 * 自定义UI的文件上传按钮
 * e.g :
    $(".wrapper").fileInput({
		formAttrs : {
			target : "postFrame",
			method : "POST",
			action : "upload.php"
		},
		fileAttrs : {
			accept : "image/*"
		},
		onselect : function(form){
			form.submit();
			form.reset();
		}
	});
 */
(function(){
	jQuery.fn.fileUploader = function(options){
		!options && (options = {});
		$.each(this, function(){
			var btn = $(this);
			//
			// 调试需要，将filer的背景色和透明度改了，运行时改过来。
			var formStyle = 'position:absolute;z-index:1000; \
							top:0; right:0;margin:0;padding:0;height:100%;width:100%; \
							opacity:.2; filter:alpha(opacity=80);background:red;';
			var form = $('<form enctype="multipart/form-data" style="'+ formStyle +'" target="_self" ></form>');
			var file = $('<input type="file" style="padding:0;margin:0;width:100%;height:100%;cursor:pointer;" />');
			form.append(file);

			//将原有结构重组
			var wrapper = $('<div style="position:relative;overflow:hidden;">'),
				clonedBtn = btn.clone(true);
			wrapper.append(clonedBtn).append(form);
			btn.replaceWith(wrapper);

			//诸如target, action,method等属性的自定义
			if(options.formAttrs){
				form.attr(options.formAttrs);
			}
			//诸如accept等属性的自定义
			if(options.fileAttrs){
				file.attr(options.fileAttrs);
			}

			var offset = clonedBtn.offset(),
				btnWidth = clonedBtn.get(0).offsetWidth;
			//console.log("btnWidth", btnWidth);
			wrapper.width(btnWidth);

			//计算鼠标指针相对btn的坐标。保证将input:file的“浏览。。。”部分对准鼠标指针 :-)
			var relPos = {top : 0, left : 0}, _ = false;
			wrapper.mousemove(function(event){
				//如果支持pageXY，则无需计算已滚动的距离，否则还得实时的去计算滚动距离加上event.clientXY.
				// [注意:最新IE已开始支持pageXY，因此用特征来hack]
				//debugger;
				if(event.pageX){
					relPos.top = event.pageY-offset.top;
					relPos.left = event.pageX-offset.left;
				}else{
					//保证只执行一次
					if(!_){
						var scroll = {
							top: document.documentElement.scrollTop,
							left: document.documentElement.scrollLeft
						};
						window.attachEvent("onscroll", function(){
							scroll = {
								top: document.documentElement.scrollTop,
								left: document.documentElement.scrollLeft
							};
						});
						_ = true;
					}
					relPos.top = event.clientY + scroll.top - offset.top;
					relPos.left = event.clientX + scroll.left - offset.left;
				}
				console.log(relPos.left , btnWidth);
				//综合各种浏览器的UI表现，在右20px上10px坐标处 都能定位到input:file的按钮区域。
				form.css({
					top : relPos.top - 10,
					left : relPos.left - btnWidth + 20
				});
			});

			if(typeof options.onselect === "function"){
				file.change(function(){
					options.onselect.apply(btn, form, file, options);
				});
			}
		});
		
	};
})();
