/**
 * @title 自定义滚动条
 * @author beanmao@tencent.com
 * @date 2015/7/6
 * @desc 注意点：
 *  1）第一个参数wrapper{HTMLElement}必须有且只有一个子元素，这个子元素作为所有可以滚动区域内容的容器。
 *  2）
 * @e.g :
 * ```js
 *  var Scroller = require("Scroller");
 *  var scroller = new Scroller(wrapper, {
 *      barClass : "bar scroller",   //自定义的滚动条样式名， 可以多个用空格分隔
 *      //在临界点触发自动拉取新数据
 *      onScrollToTop : function(wrapper, content){ //滚动到顶部，触发拉取翻页数据
 *          if(scroller._is_loading){
 *              return console.log("some data onloading, wating plz.");
 *          }
 *          var scroller = this,
 *              loading = $("#loadingTop").show();
 *          scroller._is_loading = true;
 *          $.ajax({
 *              url : "http://xxx.xxx",
 *              data : { start : 11, limit : 10 },
 *              success : function load(data){
 *                  loading.hide();
 *                  var html = tmpl(data);
 *                  content.append(tmpl(data));
 *                  scroller.refresh("top");
 *              },
 *              complete : function complete(){
 *                  scroller._is_loading = false;
 *              }
 *          });
 *      }
 *  });
 *  scroller.scrollTo(-100);
 * ```
 * -------------------
 * chrome按住系统滚动条（右侧）拖动的交互方案：
 * 在里滚动条左边线140px的范围内同步可以拖动，超过140的范围不响应。
 */
void function(){
    if(!window.jQuery){
        throw new Error("'Scroller' moodule deppended on jQuery.");
    }
    /**
     * @params {HTMLElement} wrapper
     * @params options :
     *      {String} className
     * @constructor
     */
    function Scroller(wrapper, options){

        !options && (options = {});
        //需要把所有的属性全部列出来
        var _defaults = {
            //滚动条的基础类型，只需要支持在右边的y方向和在下面的x方向。默认y
            //direction : "y",
            //滚动条wrapper的className
            barWrapperClass : "",
            //滚动条的className
            barClass : "",
            //每次mouseWheel滚动的像素（绝对值）浏览器默认滚轮一次滚动3行因此这里默认60.
            wheelSize : 60,
            //滚动条的最小高度（或宽度），优化体验，不允许无限小。
            barMinSize : 30,
            //滚动条在滚动槽内离上下边界的最小间隔.默认2px.
            barGap : 2,
            //是否初始化显示
            //initShow : false,
            //滚动到最顶部的时候
            onScrollToTop : null,
            //滚动到最底部的时候
            onScrollToBottom : null
        };

        for(var i in _defaults){
            if(!options.hasOwnProperty(i)){
                options[i] = _defaults[i];
            }
        }

        this.options = options;

        //最外层的容器（遮罩层），注意两个css属性一定需要
        wrapper = $(wrapper);
        wrapper.css({
            position : "relative",
            overflow : "hidden"
        });

        //内容层。所有滚动区域的内容都追加在这content后面。
        var content = wrapper.children(":first");
        content.css({
            width : "100%",
            position : "absolute",
            left : 0,
            top : 0
        });

        //滚动条<div>
        var barWrapper = $('<div tag="barWrapper"> \
                                <div tag="barScroller">\
                                    <i class="scroller-bar-edge top"></i>\
                                    <i class="scroller-bar-edge-middle"></i>\
                                    <i class="scroller-bar-edge bottom"></i>\
                                </div>\
                            </div>');
        wrapper.append(barWrapper);

        var bar = barWrapper.find("[tag='barScroller']");
        bar.css("position", "relative");

        //滚动条容器的样式
        barWrapper.css("position",  "absolute");

        //两种状态下的滚动条位置
        barWrapper.css({right : 0,  top : 0,    width : 11,   height : "100%" });
        this._bar_height = 0;

        //TODO:暂时耦合进一个class
        barWrapper.addClass("scroll-bar-wrapper");
        //可以通过class name来控制基本样式
        if(options.barWrapperClass){
            barWrapper.addClass(options.barWrapperClass);
        }
        //TODO:同上面的todo
        bar.addClass("scroll-bar");
        if(options.barClass){
            bar.addClass(options.barClass);
        }

        //几个关键元素的聚合
        this.elements = {
            wrapper : wrapper,
            content : content,
            barWrapper : barWrapper,
            bar : bar
        };

        //模拟鼠标滚轮滚动
        var scroller = this;

        var __mousedown = false, //是否按下鼠标（拖动时）
            __start_point_y = null;//开始拖动时按下的起始坐标位置

        wrapper.on({
            "mousewheel" : function(e){
                if(!scroller.has_scroll){
                    return false;
                }
                var delta = e.originalEvent.wheelDelta/120,
                    target = scroller.scroll_top + delta * scroller.options.wheelSize;
                scroller.scrollTo(target);
            },
            //TODO:按住滚动条在可拖动范围(按照chrome的经验，距离左边线140px)内拖动时跟着滚动， 后面实现
            "mousemove" : function(e){
                console.log(__mousedown);
                if(__mousedown){
                    var barDelta = e.pageY - __start_point_y,
                        scrollDelta = barDelta * (scroller._contetn_height / scroller._wrapper_height);
                    scroller.scroll(scrollDelta);
                    //console.log("MOVE:", barDelta, scrollDelta);
                    __start_point_y = e.pageY;
                }
            },
            "mouseup" : function(){
                __mousedown = false;
            }
        });

        //点击滚动槽，滚动到点击的位置
        barWrapper.on({
            "click" : function(e){
                //如果点到滚动条自身上面，忽略掉动作。
                if(e.target === bar.get(0)){
                    return false;
                }
                //_move_to_point(e.pageY);
                var relativeY = e.pageY - scroller._bar_offset_top,
                    rate = relativeY/scroller._wrapper_height,
                    target = scroller._contetn_height * rate - scroller._wrapper_height/2;
                //debug(pointY, scroller._bar_offset_top, relativeY, rate, -target)
                scroller.scrollTo(-target);
            },
            "mousedown" : function(e){
                __mousedown = true;
                __start_point_y = e.pageY;
                //__start_scroll_top = scroller.scroll_top;
                e.preventDefault();
            }
        });

        this.refresh();
    }

    // 为了配合在按下滚动条拖动状态的体验优化，这里需要设置全局的鼠标事件
    // 同一时间，一个鼠标只能按住一个滚动条，因此不考虑多滚动条交叉干扰的问题。
    $(window).on("mouseup", function(){
        __mousedown = false;
    });

    /**
     * set prototype.
     */
    Scroller.prototype = {
        /**
         * 重置constructor
         */
        constructor : Scroller,

        /**
         * 所有相关html元素的集合
         */
        elements : {
            wrapper : null, //最外层容器
            content : null, //内容区域
            barWrapper : null,//滚动条容器
            bar : null //滚动条
        },

        /**
         * 滚动条是否处于启用状态（初始化时为默认为启用状态）
         */
        enabled : true,

        /**
         * 是否需要滚动（只有在content高度大于外层wrapper时才需要滚动条）
         */
        has_scroll : false,

        /**
         * 滚动偏移的位置。
         */
        scroll_top : 0,

        /**
         * 在当前位置上滚动（参数为间隔值，向量，与原始的页面Y轴正方向一致）
         */
        scroll : function(delta){
            return this.scrollTo(this.scroll_top - delta);
        },

        /**
         * 将当前viewport滚动到指定位置, 需要计算一个不能越界的目标位置.
         * 向上滚动top值不能超过一个设定的距离（10px）；向下滚动top值不能超过(content.height-wrapper.height-10)px
         */
        scrollTo : function(target){
            //当前传入参数不对，或者没有可滚动的条件 忽略
            if(!this.has_scroll || typeof target !== "number"){
                return false;
            }

            var eles = this.elements;
            //目标位置的最大滚动边界边界(按照实际的css top值来定义，因此是负值)
            var contentScrollLimit = this._wrapper_height - this._contetn_height;

            //目标位置超越了边界值时进行校正，并触发边界事件（如果定义了），事件先执行。
            if(target > 0){
                if(typeof this.onScrollToTop === "function"){
                    this.onScrollToTop.call(this, target);
                }
                target = 0;
            }else if(target < contentScrollLimit){
                if(typeof this.onScrollToBottom === "function"){
                    this.onScrollToBottom.call(this, target);
                }
                target = contentScrollLimit;
            }
            ////如果目标位置没有变化，那么滚动体啥也不做。
            //if(target === this.scroll_top){
            //    return false;
            //}

            //更新内容滚动的位置
            eles.content.css("top", target);
            //debugger
            //更新滚动条的滚动位置。需要调整边界
            var barTarget = (-target) * (this._wrapper_height / this._contetn_height),
                //滚动槽顶部和底部的最小间隙
                barGap = this.options.barGap,
                //最多可以滚动的边界
                barScrollLimit = this._wrapper_height - this._bar_height - barGap;
            //直接计算边界，这里不同于上面的内容区，无需触碰边界的事件。
            barTarget = Math.max(barGap, Math.min(barTarget, barScrollLimit));
            eles.bar.css("top", barTarget);

            //更新内容的滚动位置
            this.scroll_top = target;

            return this;
        },

        /**
         * 直接滚动到最顶部
         */
        scrollToTop : function(){
            return this.scrollTo(0);
        },
        /**
         * 直接滚动到最底部
         */
        scrollToBottom : function(){
            return this.scrollTo(this._wrapper_height - this._contetn_height);
        },

        /**
        * 刷新状态
        */
        refresh : function(position){
            var eles = this.elements;

            var wrapperHeight = eles.wrapper.height(),
                contentHeight = eles.content.height();
            //console.log(contentHeight , wrapperHeight)
            this._wrapper_height = wrapperHeight;
            this._contetn_height = contentHeight;
            this._bar_offset_top = eles.barWrapper.offset().top;
            if(contentHeight > wrapperHeight){
                this.has_scroll = true;
                var _height = (wrapperHeight/contentHeight) * wrapperHeight;
                this._bar_height = Math.max(_height, this.options.barMinSize);
                eles.barWrapper.show();
                eles.bar.height(this._bar_height);
            }else{
                this.has_scroll = false;
                eles.barWrapper.hide();
            }

            !position && (position = "top");
            if(typeof position === "string"){
                position = position.toLowerCase();
                if(position === "top"){
                    this.scrollToTop();
                }else if(position === "top"){
                    this.scrollToBottom();
                }
            }else if(typeof position === "number"){
                this.scrollTo(position);
            }
            //this.scrollToTop();
            return this;
        },

        /**
         * 启用滚动条
         */
        enable : function(){
            //if(this.enabled){
            //    return this;
            //}
            var eles = this.elements;
            eles.barWrapper.show();
            this.scrollTo(this.scroll_top);
            this.enabled = true;
            return this;
        },

        /**
         * 禁用滚动条.内容位置回到顶部,隐藏滚动条区域，但是事件仍然保留。
         */
        disable : function(){
            //if(!this.enabled){
            //    return this;
            //}
            var eles = this.elements;
            eles.barWrapper.hide();
            this.scrollTo(0);
            this.enabled = false;
            return this;
        },
        /**
         * 销毁滚动条实例以及解绑相关事件
         */
        destroy : function(){
            ////先将内容滚动到顶部
            //this.scrollToTop();
            ////删除滚动条，并解除绑定的事件
            //var eles = this.elements;
            //eles.barWrapper.unbind("click").unbind("mousedown").remove();
            //eles.wrapper.unbind("mousewheel").unbind("mousemove");
        }
    };

    if(typeof define === "function" && (define.amd || define.cmd)){
        define(function(require, exports, module){
            module.exports = Scroller;
        });
    }else{
        window.Scroller = Scroller;
    }
}();
