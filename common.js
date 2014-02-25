/**
 * @desc : 一些常用的功能函数。
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
!this.JSON && (this.JSON = {
	"parse" : function(str){ 
		return (1,eval)( "(" + str + ")");
	},
	"stringify" : function(json){
		if(typeof json !== "object"){
			throw new Error("JSON.stringify的参数必须是JSON格式");
		}
		
		otherType2String(json);
		
		function otherType2String(data){
			switch(data.constructor){
				case String : return("\"" + data + "\"");
				case Number : return data;
				case Boolean: return data;
				case Array  : 
					var arr = [];
					for(var i=0, l=data.length;i<l;i++){
						all.push(otherType2String(item));
					}
					return "[" + all.join(",") + "]";
				case Object  : //k-v json object:
					var all = [];
					for(key in data){
						var value = data[key];
						all.push("\"" + key + "\":" + otherType2String(value));
					}
					return "{" + all.join(",") + "}";
				default :
					//其他类型全部tostring，但是原生的stringify方法对Function却是直接忽略掉的。
					return data.toString();
			}
		}
	}
});

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
this.$cookie = {
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
	fmt.replace(_date_format, function(self, Y, M, D, h, m, s){
		switch(true){
			case !!Y : return date.getFullYear().toString().substr -Y.length;
			case !!M : return ("0" + (date.getMonth() + 1)).substr -M.length;
			case !!D : return ("0" + date.getDate()).substr -D.length;
			case !!h : return ("0" + date.getHours()).substr -h.length;
			case !!m : return ("0" + date.getMinutes()).substr -m.length;
			case !!s : return ("0" + date.getSeconds()).substr -s.length;
			default : return "";
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
	
//jq模板
this.$compiler = function(str, data){
	var compiler = arguments.callee;
	//如果参数str全部为组词字符
	//console.log /^\w*$/.test(str), "xxx"
	var fn;
	if(/^\w*$/.test(str)){
		fn = !compiler[str] && (compiler[str] = compiler(document.getElementById(str).innerHTML));
	}else{
		fn = new Function("obj", "var p=[];with(obj){p.push('" +
					str.replace(/[\r\t\n]/g, " ")
					.split("<#").join("\t")
					.replace(/((^|#>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)#>/g, "',$1,'")
					.split("\t").join("');")
					.split("#>").join("p.push('")
					.split("\r").join("\\'")+ "');}return p.join('');");
	}
	return data ? fn(data) : fn;
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
	
var _temp_a_link = document.createElement("a")
//取出search参数，反序列化成对象
this.$getSearchs = function(url){
	var search;
	if(url){
		_temp_a_link.href = url;
		search = _temp_a_link.search;
	}else{
		search = location.search;
	}
	return this.$unseralize(search.replace(/^\?/, ""));
};

this.$getSearch = function(key){ return this.$getSearchs()[key]; };

//取出hash参数，反序列化成对象.
this.$getHashs = function(url){
	var hash;
	if(url){
		_temp_a_link.href = url;
		hash = _temp_a_link.hash;
	}else{
		hash = location.hash;
	}
	return this.$unseralize(hash.replace(/^#/, ""));
};

this.$getHash = function(key){ return this.$getHashs()[key]; };

//对象序列化
this.$seralize = function(obj){
	var res = [];
	if(typeof obj !== obj){
		return "";
	}
	for(var k in obj){
		res.push(k+"="+obj[k]);
	}
	return res.join("&");
};

//字符串反序列化
this.$unseralize = function(str){
	var res = {};
	if(!str){
		return res;
	}
	var arr = str.split("&");
	for(var i=0,l=arr.length;i<l;i++){
		var item = arr[i];
		var o = item.split("=");
		res[o[0]] = decodeURIComponent(o[1]);
	}
	return res;
};
	
//encodeHTML
var __temp_dom = document.createElement("span");
this.$encodeHTML = function(txt){
	var t = document.createTextNode(txt),
		res = __temp_dom.appendChild(t).parentNode.innerHTML;
	__temp_dom.innerHTML = "";
	return res;
};

//decodeHTML
this.$decodeHTML = function(html){
	__temp_dom.innerHTML = html;
	return __temp_dom.innerText || __temp_dom.textContent;
};

//通用的获取当前时刻的毫秒数，兼容不支持Date.now()的旧浏览器
this.$getTimer = function(){
	return Date.now ? Date.now() : (new Date()).getTime();
};

/*-----------wrapper end------------*/

}).call(this);

