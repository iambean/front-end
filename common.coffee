unless window.console
	window.console = {}
	console.log = console.warn = console.warn =  ()->

###JSON###
window.JSON ||=
	"parse" : (str)-> eval "(" + str + ")"
	#e.g: JSON.parse(JSON.stringify({b:"BBB", c:true, d:78, e:{e1:"AA", e2:45, e3:{"Xa":45, "Xb":[]}}, f : [23, true, 487, "daa", [1,2,4]]}))
	"stringify" : (json) ->
		throw new Error("JSON.stringify的参数必须是JSON格式") if typeof json isnt "object"
		otherType2String = (data)->
			switch data.constructor
				when String then "\"" + data + "\""
				when Number then data
				when Boolean then data
				when Array
					all = []
					for item in data
						all.push otherType2String item
					"[" + all.join(",") + "]"
				when Object # k-v json object:
					all = []
					for key, value of data
						all.push ("\"" + key + "\":" + otherType2String value)
					"{" + all.join(",") + "}"
				else data.toString() #其他类型全部tostring，但是原生的stringify方法对Function却是直接忽略掉的。
		otherType2String(json)

#cookie functions:
$cookie =
	get : (name)->
		return null unless name and @has(name)
		reg = new RegExp("(?:^|.*;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*")
		decodeURIComponent document.cookie.replace(reg, "$1")
	del : (name, domain)->
		return false unless name and @has(name)
		document.cookie = encodeURIComponent(name) + "=; max-age=0; path=/; "+"domain=" + domain
	has : (name)->
		reg = new RegExp("(?:^|;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")
		reg.test(document.cookie)

#创建一个命名空间，并执行初始化函数。 e.g:$.ns("a.b.c", function(){console.log(window.a.b.c===this);});//loged "true".
$ns = (str, fn)->
	#必须是形如 "aa.b.ccc"这种形式
	return false unless /^\w+(\.\w+)*$/.test(str)
	_parent = window
	arr = str.split "."
	for o in arr
		_parent[o] = {} unless _parent[o]
#		console.log "xxx:",_parent, o
		_parent = _parent[o]
	fn.call _parent if fn

#title:时间格式化
$dateFormat = (date, fmt)->
	_re_date_format = /(Y{2,4})|(M{1,2})|(D{1,2})|(h{1,2})|(m{1,2})|(s{1,2})/g
	fmt.replace _re_date_format, (self, Y, M, D, h, m, s)->
		switch true
			when !!Y then date.getFullYear().toString().substr -Y.length
			when !!M then ("0" + (date.getMonth() + 1)).substr -M.length
			when !!D then ("0" + date.getDate()).substr -D.length
			when !!h then ("0" + date.getHours()).substr -h.length
			when !!m then ("0" + date.getMinutes()).substr -m.length
			when !!s then ("0" + date.getSeconds()).substr -s.length
			else ""

#jq模板
$compiler = (str, data)->
	compiler = arguments.callee
	#如果参数str全部为组词字符
#	console.log /^\w*$/.test(str), "xxx"
	fn = if /^\w*$/.test(str)
		compiler[str] ||= compiler(document.getElementById(str).innerHTML)
	else
		new Function "obj", "var p=[];with(obj){p.push('" +
					str.replace(/[\r\t\n]/g, " ")
					.split("<#").join("\t")
					.replace(/((^|#>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)#>/g, "',$1,'")
					.split("\t").join("');")
					.split("#>").join("p.push('")
					.split("\r").join("\\'")+ "');}return p.join('');"
	if data then fn(data) else fn

#获取浏览器版本号
$isBrowser = (str)->
	str = str.toLowerCase()
	b = navigator.userAgent.toLowerCase()
	arrB =
		'firefox' : b.indexOf("firefox") isnt -1
		'opera' : b.indexOf("opera") isnt -1
		'safari' : b.indexOf("safari") isnt -1
		'chrome' : b.indexOf("chrome") isnt -1
	arrB['gecko'] = not arrB['opera'] and not arrB['safari'] and b.indexOf("gecko")>-1
	arrB['ie'] = not arrB['opera'] and b.indexOf("msie") isnt -1
	arrB['ie6'] = not arrB['opera'] and b.indexOf("msie 6") isnt -1
	arrB['ie7'] = not arrB['opera'] and b.indexOf("msie 7") isnt -1
	arrB['ie8'] = not arrB['opera'] and b.indexOf("msie 8") isnt -1
	arrB['ie9'] = not arrB['opera'] and b.indexOf("msie 9") isnt -1
	arrB['ie10'] = not arrB['opera'] and b.indexOf("msie 10") isnt -1
	arrB[str]

_temp_a_link = document.createElement("a")
#取出search参数，反序列化成对象
$getSearchs = (url)->
	if url
		_temp_a_link.href = url
		search = _temp_a_link.search
	else
		search = location.search
	$unseralize(search.replace(/^\?/, ""))

$getSearch = (key)->@$getSearchs()[key]

#取出hash参数，反序列化成对象.
$getHashs = (url)->
	if url
		_temp_a_link.href = url
		hash = _temp_a_link.hash
	else
		hash = location.hash
	$unseralize(hash.replace(/^#/, ""))

$getHash = (key)->@$getHashs()[key]

#对象序列化
$seralize = (obj)->
	res = for k,v of obj then k+"="+v
	res.join("&")

#字符串反序列化
$unseralize = (str)->
	res = {}
	return res unless str
	for item in str.split("&")
		o = item.split("=")
		res[o[0]] = decodeURIComponent(o[1])
	res

#通用的获取当前时刻的毫秒数，兼容不支持Date.now()的旧浏览器
$getTimer = ()-> if Date.now then Date.now() else (new Date()).getTime()
