/**
 * Created by beanmao on 2014/12/25.
 * @title 分页器
 * @desc 抽象一个分页器，可以指定模板，但是必须遵守指定的规则设置tag，支持自定义组合如下元素：
 * 		第一页、上一页、下一页、最后一页、跳转到指定页等。
 * 	所有的跳转函数都抽象到指定的回调函数handle，参数为目标页码等.
 * @author beanmao@tencent.com
 * @date 01/04/2015
 * @param options
 * 	@param wrapper {HTML DOM} 容器 required.
 * 	@param
 * @eg :
 var Paginater = require("Paginater"),
 pager = new Paginator({
	//要填充的容器dom
	wrapper : $("#pagerWrapper").get(0),
	//初始化时显示的页码
	currPage : 1,
	//总页码
	totalPage : 1,
	//页码输入框中允许输入的数字长度（位数）
	maxlength : 4,
	//每个跳转按钮的事件公共回调。参数key控制各个触发器的名称。（一共有first/prev/next/last/[具体的页码数字]五种值）
	handle : function(targetPage, tag, e){
		console.log("要跳转到第"+targetPage+"页");
	}
});
 */
;
(function(window){
	/**
	 * @param options
	 * @constructor Paginator
	 */
	function Paginator(options){
		//先将参数全部挂到对象上。
		this.options = options;

		var htmlTmpl = options.htmlTmpl;
		if(!htmlTmpl){
			htmlTmpl = '<p class="page-turn">\
					<a tag="first" class="first-page" href="#" title="点击去到第一页" hidefocus="">|&lt;</a>\
					<a tag="prev" class="prev-page" href="#" title="上一页" hidefocus="">&lt;</a>\
					<input type="text" maxlength="3">\
					<span class="page-total">/<span tag="total" ></span></span>\
					<a tag="go" href="#" hidefocus="">GO</a>\
					<a tag="next" class="next-page" title="下一页" href="#" hidefocus="">&gt;</a>\
					<a tag="last" class="last-page" href="#" title="点击去到最后一页" hidefocus="">&gt;|</a>\
				</p>';
		}

		var wrapper = $(options.wrapper);

		wrapper.html(htmlTmpl);

		this.wrapper = wrapper;
		this.currPage = options.currPage * 1;
		this.totalPage = options.totalPage * 1;

		//几个关键元素:
		this.elems = {
			first 	: wrapper.find("[tag='first']"),
			prev 	: wrapper.find("[tag='prev']"),
			input 	: wrapper.find(":text"),
			curr	: wrapper.find("[tag='curr']"),//input和curr应该只允许一个，input是可以输入页码型，curr是不可输入型。
			total 	: wrapper.find("[tag='total']"),
			go 	: wrapper.find("[tag='go']"),
			next 	: wrapper.find("[tag='next']"),
			last 	: wrapper.find("[tag='last']")
		};

		var that 	= this,
			elems 	= this.elems,
			first 	= elems.first,
			prev 	= elems.prev,
			input 	= elems.input,
			total 	= elems.total,
			go 	= elems.go,
			next 	= elems.next,
			last 	= elems.last;

		/**
		 * 点击几个代表相对值的按钮时，将标记值传入回调执行。
		 */
		first.add(prev).add(next).add(last).click(function(e){
			var tag = $(this).attr("tag");
			if(typeof options.handle === "function"){
				var targetNum = {
					"first" : 1,
					"prev" 	: that.currPage - 1,
					"next"  : that.currPage + 1,
					"last"  : that.totalPage
				}[tag];
				//合法区间计算
				targetNum = Math.max(1, Math.min(targetNum, that.totalPage));
				if(targetNum !== that.currPage){
					options.handle.call(that, targetNum, tag, e);
				}
			}
			return false;
		});

		/**
		 * 在页码输入框内回车则用go按钮的click事件代理执行。
		 */
		if(input.length > 0){
			input.keypress(function(e){
				var kc = e.keyCode;
				if(kc === 13){
					go.click();
				}else if(/\D/.test(String.fromCharCode(kc))){
					return false;
				}
			});
			//设置maxlength:
			var maxlen = parseInt(options.maxlength);
			if(!isNaN(maxlen) && maxlen>0){
				input.attr("maxlength", maxlen);
			}
		}

		/**
		 * 点击跳转时先检查一下页码输入框的值，如果非法则默认第一页，否则解出页码值。
		 * 把页码值传入给回调函数,这里为了保证执行侧有一定的区分度，页码值严格限制为number而不能传入string。
		 */
		if(go.length > 0){
			go.click(function(e){
				var pageNum = $.trim(input.val());
				if(/^\d+$/.test(pageNum)){
					pageNum *= 1;
				}else{
					pageNum = 1;
				}
				options.handle.call(that, pageNum, "go", e);
				return false;
			});
		}

		//初始化状态
		this.refresh(options.currPage, options.totalPage);
	}

	/**
	 * prototype属性定义。
	 */
	Paginator.prototype = {
		//初始化的参数挂载
		options : null,
		//容器
		wrapper : null,
		//几个关键dom元素
		elems	: null,
		//当前页码
		currPage : 0,
		//总页码
		totalPage : 0,
		//刷新状态的方法
		refresh : function(currPage, totalPage){
			if(currPage < 1 || totalPage < 1 || currPage > totalPage){
				return false;
			}
			this.currPage = currPage * 1;
			this.totalPage = totalPage * 1;

			//doms:
			var elems 	= this.elems,
				input 	= elems.input,
				curr 	= elems.curr,
				total 	= elems.total;

			if(input.length > 0){
				input.val(this.currPage);
			}

			if(curr.length > 0){
				curr.text(this.currPage);
			}

			total.text(this.totalPage);

			if(typeof this.options.onRefresh === "function"){
				this.options.onRefresh.call(this);
			}
		}
	};

	//构造器还原
	Paginator.prototype.constructor = Paginator;

	//1)依赖jQuery， 2)支持amd/cmd规范。
	if(!window.jQuery){
		return window.console || window.console.error || window.console.error("jquery required!");
	}
	if(typeof define === "function" && (define.amd || define.cmd)){
		define(function (require, exports, module) {
			return Paginator;
		});
	}else{
		window.Paginator = Paginator;
	}
})(window);
