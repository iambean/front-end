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
 *
 *  });
 *  scroller.scrollTo(-100);
 * ```
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
        //需要把所有的属性全部列出来
        var _defaults = {
            //滚动条的基础类型，只需要支持在右边的y方向和在下面的x方向。默认y
            //direction : "y",
            //滚动条wrapper的classname
            barWrapperClass : "",
            //滚动条的classname
            barClass : "",
            //每次mousewheel滚动的像素（绝对值）
            wheelSize : 10,
            //滚动条的最小高度（或宽度），优化体验，不允许无限小。
            barMinSize : 10,
            //是否初始化显示
            initShow : true,
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
        var content = wrapper.children();
        content.css({
            width : "100%",
            position : "absolute",
            left : 0,
            top : 0
        });

        //滚动条<div>
        var barWrapper = $('<div tag="barWrapper"> \
                                <div tag="barScroller"></div>\
                            </div>');
        wrapper.append(barWrapper);

        var bar = barWrapper.find("[tag='barScroller']");
        bar.css("position", "relative");

        //滚动条容器的样式
        barWrapper.css("position",  "absolute");

        //两种状态下的滚动条位置
        barWrapper.css({right : 0,  top : 0,    width : "10px",   height : "100%" });
        this._bar_height = 0;
        //if(options.direction === "x"){
        //    barWrapper.css({left : 0,   bottom : 0, width : "100%",   height : "10px" });
        //}else{
        //    barWrapper.css({right : 0,  top : 0,    width : "10px",   height : "100%" });
        //    this._bar_height = 0;
        //}

        //可以通过class name来控制基本样式
        if(options.barWrapperClass){
            barWrapper.addClass(options.barWrapperClass);
        }
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

        if(options.initShow){
            this.refresh();
        }

        //模拟鼠标滚轮滚动
        var scroller = this;
        wrapper.on("mousewheel", function(e){
            if(!scroller._has_scroll){
                return false;
            }
            var delta = e.originalEvent.wheelDelta/120,
                target = scroller._scroll_top + delta * scroller.options.wheelSize;
            scroller.scrollTo(target);
        });

        //点击滚动槽或者按住滚动条拖动，都可以实时的滚动。
        barWrapper.bind({
            "click" : function(e){
                //如果点到滚动条自身上面，忽略掉动作。
                if(e.target === bar.get(0)){
                    return false;
                }
                _move_to_point(e.pageY);
            },
            "mousemove" : function(e){
                if(__mousedown){
                    _move_to_point(e.pageY);
                }
            }
        });

        /**
         * 滚动条滚动到某个某个目标位置（中心点的位置）
         */
        function _move_to_point(pointY){
            var relativeY = pointY - scroller._bar_offset_top,
                rate = relativeY/scroller._wrapper_height,
                target = scroller._contetn_height * rate - scroller._wrapper_height/2;
            scroller.scrollTo(-target);
        }
    }

    // 为了配合在按下滚动条拖动状态的体验优化，这里需要设置全局的鼠标事件
    // 同一时间，一个鼠标只能按住一个滚动条，因此不考虑多滚动条交叉干扰的问题。
    var __mousedown = false;
    $(window).bind({
        "mousedown" : function(){
            __mousedown = true;
        },
        "mouseup" : function(){
            __mousedown = false;
        }
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
        elements : null,
        /**
         * 是否需要滚动（只有在content高度大于外层wrapper时才需要滚动条）
         */
        _has_scroll : false,
        /**
         * 滚动偏移的位置。
         */
        _scroll_top : 0,
        /**
         * 将当前viewport滚动到指定位置, 需要计算一个不能越界的目标位置.
         * 向上滚动top值不能超过0；向下滚动top值不能超过(content.height-wrapper.height)
         */
        scrollTo : function(top){
            //当前传入参数不对，或者没有可滚动的条件，或者目标值和当前已经滚动的值相等，则无视之。
            if(!this._has_scroll || typeof top !== "number" || top === this._scroll_top){
                return false;
            }
            var minTop = this._wrapper_height - this._contetn_height,
                target = Math.min(0, Math.max(minTop, top));

            this._scroll_top = target;

            //更新content的滚动位置
            this.elements.content.css("top", target);

            //更新滚动条的滚动位置
            var scrollRate = (Math.abs(target) + this._wrapper_height * 0.5)/this._contetn_height,
                barTop = scrollRate * this._wrapper_height - this._bar_height/2;
            //barTop = Math.max(0, Math.min(barTop, ));
            this.elements.bar.css("top", barTop);
            return this;
        },
        /**
         * 滚动到顶部
         */
         scrollToTop : function(){
             return this.scrollTo(0);
         },
         /**
         * 滚动到底部
         */
        scrollToTop : function(){
            return this.scrollTo(this._wrapper_height - this._content_height);
        },
        /**
         * 刷新状态
         */
        refresh : function(){
            var eles = this.elements;
            var wrapperHeight = eles.wrapper.height(),
                contetnHeight = eles.content.height();
            this._wrapper_height = wrapperHeight;
            this._contetn_height = contetnHeight;
            this._bar_offset_top = eles.barWrapper.offset().top;
            console.log(contetnHeight , wrapperHeight)
            if(contetnHeight > wrapperHeight){
                this._has_scroll = true;
                eles.barWrapper.show();
                var _height = (wrapperHeight/contetnHeight) * wrapperHeight;
                this._bar_height = Math.max(_height, this.options.barMinSize);
                eles.bar.height(this._bar_height);
            }else{
                this._has_scroll = false;
                eles.barWrapper.hide();
            }
            return this;
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
