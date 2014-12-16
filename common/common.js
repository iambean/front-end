/**
 * @desc : 一些常用的功能函数。
 * @author:Bean(mbn.bean@gmail.com)
 */

(function(){
	
/*-----------wrapper start------------*/

var __empty_fn = function() {};

if(!this.console){
	this.console = {};
	console.log = console.warn = console.warn = __empty_fn;
}

//JSON
//e.g: JSON.parse(JSON.stringify({b:"BBB", c:true, d:78, e:{e1:"AA", e2:45, e3:{"Xa":45, "Xb":[]}}, f : [23, true, 487, "daa", [1,2,4]]}))
!this.JSON && (this.JSON = function(){
	var otherType2String = function (data){
		switch(data.constructor){
			case String : return("\"" + escape(data) + "\"");
			case Number : return data;
			case Boolean: return data;
			case Function: return "";//原生的stringify方法对Function却是直接忽略掉的。
			case Array  :
				var all = [];
				for(var i=0, l=data.length;i<l;i++){
					all.push(otherType2String(data[i]));
				}
				return "[" + all.join(",") + "]";
			default: //k-v json object and other objects
				var all = [];
				for(var key in data){
					if(data.hasOwnProperty(key)){
						var value = data[key];
						all.push("\"" + escape(key) + "\":" + otherType2String(value));
					}
				}
				return "{" + all.join(",") + "}";
		}
	};
	return {
		"parse" : function(str){
			return (1,eval)( "(" + str + ")");
		},
		"stringify" : function(json){
			if(typeof json !== "object"){
				window.console && console.warn && console.warn("JSON.stringify的参数必须是JSON格式");
			}
			return otherType2String(json);
		}
	};
	
	 //对双引号和斜杠特殊字符转义
    	function escape(s){
        	return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
    	}
}());

//找到数组中满足条件的第一项，找到就立即返回，不会继续往后找，这是跟jQuery.grep不同的地方。
this.$select = function(arr, fn){
	for(var i=0,l=arr.length;i<l;i++){
		var item = arr[i];
		if(fn(item) === true){
			return item;
		}
	}
	return null;
};

//cookie functions:
this.$COOKIE = {
	get : function(name){
		if(!name || !this.has(name)){
			return null;
		}
		var reg = new RegExp("(?:^|.*;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*");
		return decodeURIComponent(document.cookie.replace(reg, "$1"));
	},
	del : function(name, domain){
		if(!name || !this.has(name)){
			return false;
		}
		document.cookie = encodeURIComponent(name) + "=; max-age=0; path=/; "+"domain=" + domain;
		return true;
	},
	has : function(name){
		var reg = new RegExp("(?:^|;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=");
		return reg.test(document.cookie);
	}
};

//创建一个命名空间，并执行初始化函数。 e.g:$.ns("a.b.c", function(){console.log(window.a.b.c===this);});//loged "true".
this.$ns = function(str, fn){
	//必须是形如 "aa.b.ccc"这种形式
	if(!/^\w+(\.\w+)*$/.test(str)){
		return false;
	} 
	var arr = str.split("."),
		_parent = this;
	for(var i=0,l=arr.length;i<l;i++){
		var o = arr[i];
		(!_parent[o]) && (_parent[o] = {});
		_parent = _parent[o]
	}
	if(fn){
		fn.call(_parent);
	}
};

//title:时间格式化
this.$dateFormat = function(date, fmt){
	var _date_format = /(Y{2,4})|(M{1,2})|(D{1,2})|(h{1,2})|(m{1,2})|(s{1,2})/g;
	return fmt.replace(_date_format, function(self, Y, M, D, h, m, s){
		switch(true){
			case !!Y : return date.getFullYear().toString().substr(-Y.length);
			case !!M : return ("0" + (date.getMonth() + 1)).substr(-M.length);
			case !!D : return ("0" + date.getDate()).substr(-D.length);
			case !!h : return ("0" + date.getHours()).substr(-h.length);
			case !!m : return ("0" + date.getMinutes()).substr(-m.length);
			case !!s : return ("0" + date.getSeconds()).substr(-s.length);
			default : return this.toLocaleDateString();
		}
	});
};
	
//在$dateFormat基础上的进一步产品化的封装，显示与客户端的相对时间，如“刚刚”，“一小时前”，“一天前”等
this.$renderTimer = function(timeObj){
	var n = this.$getTimer(),
		ts = Math.floor((n - timeObj.getTime())/1000);
	//时间：一分钟内、**分钟前(小于一小时)、**小时前（大于1小时小于24小时）、具体日期时间（年月日时分秒）。
	var idx = [ts<60, ts<3600, ts<3600*24, ts>=3600*24 ].indexOf(true);
	
	return idx<0 ? "" : [
							"刚刚",
							Math.floor(ts/60) + "分钟前",
							Math.floor(ts/3600) + "小时前",
							$dateFormat(timeObj, "YYYY.MM.DD")
						][idx];
};
	


//获取浏览器版本号
this.$isBrowser = function(str){
	var str = str.toLowerCase(),
		b = navigator.userAgent.toLowerCase();
	var arrB = {
		'firefox' : b.indexOf("firefox") > -1,
		'opera' : b.indexOf("opera") > -1,
		'safari' : b.indexOf("safari") > -1,
		'chrome' : b.indexOf("chrome") > -1
	};
	arrB['gecko'] = !arrB['opera'] && !arrB['safari'] && b.indexOf("gecko")>-1;
	arrB['ie'] = !arrB['opera'] && b.indexOf("msie") > -1;
	arrB['ie6'] = !arrB['opera'] && b.indexOf("msie 6") > -1;
	arrB['ie7'] = !arrB['opera'] && b.indexOf("msie 7") > -1;
	arrB['ie8'] = !arrB['opera'] && b.indexOf("msie 8") > -1;
	arrB['ie9'] = !arrB['opera'] && b.indexOf("msie 9") > -1;
	arrB['ie10'] = !arrB['opera'] && b.indexOf("msie 10") > -1;
	return arrB[str];
};
	
/**
 * HTML相关的操作功能集
 */
this.$HTML = function(){
	//创建一个临时dom，后面用到
	var __temp_dom = document.createElement("span");
	return {
		/**
		 * 将html代码转义成实体字符
		 */
		encode : function(txt){
			var t = document.createTextNode(txt),
				res = __temp_dom.appendChild(t).parentNode.innerHTML;
			__temp_dom.innerHTML = "";
			return res;
		},
		/**
		 * 将html实体字符还原成html格式代码
		 */
		decode : function(html){
			__temp_dom.innerHTML = html;
			return __temp_dom.innerText || __temp_dom.textContent;
		},
		/**
		 * 利用浏览器构造dom的特性修复错乱的HTML。
		 */
		fix : function(html){
			__temp_dom.innerHTML = html;
			return __temp_dom.innerHTML;
		},
		/**
		 * html模板引擎
		 */
		compile : function(options){
			//向前兼容（以前这样用：$HTML.compile("aDomId", {x:"XX", y:"YY"})）;
			if(typeof options === "string"){
				var o = {data : arguments[1], format : ["{%", "%}"]};
				o[!/\w/.test(options) ? "str" : "id"] = options;
				options = o;
				o = null;
			}
			//参数必须是k-v格式，并且，id和str至少二选一
			if(typeof options !== "object" || (!options.id && !options.str)){
				return "params error.";
			}

			var compile = arguments.callee,
				id= options.id,
				str = options.str,
				data = options.data,
				format = options.format || ["<%", "%>"];

			// 如果参数str全部为组词字符，则表示传入的是DOM id(注意：domid不能含有\W字符，比如中划线),
			// 那么此时将这个id对应的模板缓存到函数体上。
			var fn;
			if(id){
				if(!compile[id]){
					compile[id] = compile({
						str : $id(id).innerHTML,
						format : format
					});
				}
				fn = compile[id];
			}else{
				var left = format[0], right = format[1];
				fn = new Function("obj", "var p=[];with(obj){p.push('" +
					str.replace(/[\r\t\n]/g, " ")
						.split(left).join("\t")
						.replace(new RegExp("((^|"+ right +")[^\\t]*)'", "g"), "$1\r")
						.replace(new RegExp("\t=(.*?)"+right, "g"), "',$1,'")

						.split("\t").join("');")
						.split(right).join("p.push('")
						.split("\r").join("\\'")+ "');}return p.join('');");
			}
			return data ? fn(data) : fn;
		}
	};
}();

/**
 * 所有关于URL相关的操作函数
 */
this.$URL = function(){
	//创建一个临时DOM，给后面的方法利用
	var _temp_a_link = document.createElement("a");
	return {
		//取出search参数，反序列化成对象
		getSearchs : function(url){
			var search;
			if(url){
				_temp_a_link.href = url;
				search = _temp_a_link.search;
			}else{
				search = location.search;
			}
			return $unseralize(search.replace(/^\?/, ""));
		},
		//获取单个的search参数
		getSearch : function(key){
			return this.getSearchs()[key];
		},
		//取出hash参数，反序列化成对象.
		getHashs : function(url){
			var hash;
			if(url){
				_temp_a_link.href = url;
				hash = _temp_a_link.hash;
			}else{
				hash = location.hash;
			}
			return $unseralize(hash.replace(/^#/, ""));
		},
		//获取单个hash参数
		getHash : function(key){
			return this.getHashs()[key];
		}
	};
}();

//通用的获取当前时刻的毫秒数，兼容不支持Date.now()的旧浏览器
this.$getTimer = function(){
	return Date.now ? Date.now() : (new Date()).getTime();
};

/*-----------wrapper end------------*/

}).call(this);

