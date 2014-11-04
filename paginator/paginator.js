/**
 * Created by beanmao on 2014/10/28.
 * @Title HON分页条组件
 * @desc 当前的分页组件只有一种交互，包含的功能按钮有：第一页first（最后一页last）、上一页prev（下一页next）、页码输入框input、跳转点击按钮go。
 * 		内部维持一个页码值，即当前态(currPage)。
 * 		当处在第一页时，first和prev处于禁用状态，其他可用;
 * 		当处在最后一页时，last和next不可用，其他可用;
 * 		当只有一页数据时 first/last/prev/next都不可用。
 */

;
/**
 * @param options
 * 	@param content {HTML DOM} 容器 required.
 * 	@param
 * @returns {{refresh: refreshStatus}}
 * @eg:
  		$paginater({
  			//要填充的容器dom
			content : $("#pagerWrapper").get(0),
			//初始化时显示的页码
			currPage : 1,
			//总页码
			totalPage : 1,
			//页码输入框中允许输入的数字长度（位数）
			maxlength : 4,
			//每个跳转按钮的事件公共回调。参数key控制各个触发器的名称。（一共有first/prev/next/last/[具体的页码数字]五种值）
			handle : function(key){
				var global = HON.videos.global,
					curr = global.currPage,
					total = global.totalPage,
					targetPage = 0;
				//参数如果是string，则有[first|prev|next|last]4个值，如果是数字，则表示要跳转到具体的页码
				if(typeof key === "string"){
					targetPage = {
						"first" : 1,
						"prev" 	: curr-1,
						"next"  : curr+1,
						"last"  : total
					}[key];
				}else{
					targetPage = key*1;
				}
				//合法区间计算
				targetPage = Math.max(1, Math.min(targetPage, total));
				HON.videos.loadData({
					page : targetPage
				});
			}
		});
 */
window.$paginater = function(options){
	var htmlTmpl = '<p class="page-turn">\
						<a tag="first" class="first-page" href="#" title="点击去到第一页" hidefocus="">|&lt;</a><span class="first-page first-page-gray">|&lt;</span><a tag="prev" class="prev-page" href="#" title="上一页" hidefocus="">&lt;</a><span class="prev-page prev-page-gray">&lt;</span><input type="text" maxlength="3"><span tag="pager" class="page-total"></span><a tag="go" href="#" hidefocus="">GO</a><a tag="next" class="next-page" title="下一页" href="#" hidefocus="">&gt;</a><span class="next-page next-page-gray">&gt;</span><a tag="last" class="last-page" href="#" title="点击去到最后一页" hidefocus="">&gt;|</a><span class="last-page last-page-gray">&gt;|</span>\
					</p>';

	var content = $(options.content);

	content.html(htmlTmpl);

	//几个重点元素
	var first 	= content.find("[tag='first']"),
		prev 	= content.find("[tag='prev']"),
		input 	= content.find(":text"),
		pager 	= content.find("[tag='pager']"),
		go 		= content.find("[tag='go']"),
		next 	= content.find("[tag='next']"),
		last 	= content.find("[tag='last']");

	/**
	 * 点击几个代表相对值的按钮时，将标记值传入回调执行。
	 */
	first.add(prev).add(next).add(last).click(function(){
		var type = $(this).attr("tag");
		options.handle(type);
		return false;
	});

	/**
	 * 在页码输入框内回车则用go按钮的click事件代理执行。
	 */
	input.keypress(function(e){
		var kc = e.keyCode;
		if(kc === 13){
			go.click();
		}else if(/\D/.test(String.fromCharCode(kc))){
			return false;
		}
	});

	/**
	 * 点击跳转时先检查一下页码输入框的值，如果非法则默认第一页，否则解出页码值。
	 * 把页码值传入给回调函数,这里为了保证执行侧有一定的区分度，页码值严格限制为number而不能传入string。
	 */
	go.click(function(){
		var pageNum = $.trim(input.val());
		if(/^\d+$/.test(pageNum)){
			pageNum *= 1;
		}else{
			pageNum = 1;
		}
		options.handle(pageNum);
		return false;
	});

	//初始化状态
	refreshStatus({
		curr : options.currPage,
		total : options.totalPage,
		maxlength : options.maxlength
	});

	/**
	 * @param curr 当前页码
	 * @param total 总页数
	 * 基本规则：curr、total必须是正整数，并且curr必须小于或等于total.
	 */
	function refreshStatus(options){
		var curr = options.curr* 1,
			total = options.total*1;
		//先将所有按钮层级的元素全部都显示，后面再针对性的隐藏
		content.children().children().show();
		input.val(curr);
		//可以通过参数设置输入框的maxlength.
		var maxlen = parseInt(options.maxlength);
		if(!isNaN(maxlen) && maxlen>0){
			input.attr("maxlength", maxlen);
		}
		pager.text("/" + total);
		if(curr === 1){
			first.add(prev).hide();
		}else{
			first.next().add(prev.next()).hide();
		}
		if(curr === total){
			last.add(next).hide();
		}else{
			last.next().add(next.next()).hide();
		}
	}
	//抛出refresh方法
	return {
		refresh : refreshStatus
	}
};
