/**
 * @title : TGP轮播组件（静态）
 * @desc :  1)选定的风格样式下单屏出现N个卡片的形式（例如three-cards）那么创建N+2个li element.多出的两个放在首尾，做连接作用。
 *          2)
 * @author : beanmao@tencent.com
 * @date : 2016/3/16
 * @e.g :
 *  var StaticSlider = require("StaticSlider");
 *  var ss = new StaticSlider(document.querySelector("#testDiv"), {
 *          //主区域UI风格相关
 *          contentStyles : {
 *              type : '3cards', //3张卡片切换的风格,默认为单张从左往右切换效果
 *              config : {      //选定风格的相关特定配置项，
 *                  mainCardWidth : 360,
 *                  mainCardHeight : 200,
 *              }
 *          },
 *          showPrevAndNext : true, //是否展示前后导航的按钮（如果条件满足）
 *          //导航栏（如缩略图）UI风格相关
 *          navStyles : {
 *              type : 'thumb', //tab切换的风格，默认thumb缩略图模式。可选'none'/'thumb'/'title'/'disc'
 *              showPrevAndNext : false //是否在导航条两侧展示前进后退按钮
 *          },
 *
 *          //每一项的公共点击行为，如数据上报等。this为<li>的element
 *          onItemClick : function(e, item, index){
 *              console.log("每个item点击都会执行， 并且是最先执行的。");
 *          },
 *
 *          //发生滑动之前的响应函数，如统计曝光率。注意当viewport的items个数>1时，
 *          //比如'3cards'时，就同时有3个响应，如果需要看是否focus的那个，则要判断参数index和currentIndex对比
 *          onSlide : function(item, index){
 *              console.log('即将发生滑动的是'， item);
 *          },
 *
 *          items : [{
 *              title : '新英雄“烬”介绍',
 *              image : 'http://p3.pstatp.com/large/1090001447585aaec8f',
 *              thumb : 'http://p3.pstatp.com/large/1090001447585aaec8f',
 *              // onClick表示自定义点击事件，如果同时有target选项，那么先执行onClick，结束就跳转到target。this为<li>的element.
 *              onClick : function(e, item, index){
 *                  console.log("点击的元素是",li, 点击坐标点是, e.pageX, e.pageY);
 *              }
 *          },{
 *              title : '暗裔剑魔 亚托克斯',
 *              image : 'http://ossweb-img.qq.com/images/lol/web201310/skin/big266000.jpg',
 *              thumb : 'http://p3.pstatp.com/large/1090001447585aaec8f',
 *              target : 'http://www.qq.com'
 *          },{
 *              title : '九尾妖狐 阿狸',
 *              image : 'http://ossweb-img.qq.com/images/lol/web201310/skin/big103000.jpg',
 *              thumb : 'http://p3.pstatp.com/large/1090001447585aaec8f',
 *              target : 'http://www.qq.com'
 *          },{
 *              title : '暗影之拳 阿卡丽',
 *              image : 'http://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg',
 *              thumb : 'http://p3.pstatp.com/large/1090001447585aaec8f',
 *              target : 'http://www.qq.com'
 *          }]
 *      });
 */
;;;
(function(window){
    'use strict';
    if(!window.jQuery){
        return console.error('jQuery need.');
    }
    /**
     * 动态插入轮播组件的相关CSS，注意这里交由重构同事来维护。
     */
    insertStyleSheets(`
         /*----------Component public styles:----------*/
        /*前一项 后一项button*/
        .tgp-slider .slide-btn-pre, .slide-btn-next{position:absolute;background:rgba(0, 0, 0, 0.3);overflow:hidden;top:50%;width:30px;height:80px;cursor: pointer;
            margin-top:-40px;z-index:10;text-align:center;cursor:pointer;}
        .tgp-slider .slide-btn-pre:hover, .slide-btn-next:hover{ background:rgba(0, 0, 0, 0.5);}
        .tgp-slider .slide-btn-pre:before, .slide-btn-next:before{position:absolute; content:""; width:20px;height:20px; display:block; top:50%; margin-top:-10px;}
        .tgp-slider .slide-btn-pre{left:10px;}
        .tgp-slider .slide-btn-next{right:10px;}
        .tgp-slider .slide-btn-pre:before{border-left:2px solid rgba(255,255,255,.8);border-bottom:2px solid rgba(255,255,255,.8);-webkit-transform:rotate(45deg);left:10px;}
        .tgp-slider .slide-btn-next:before{border-right:2px solid rgba(255,255,255,.8);border-bottom:2px solid rgba(255,255,255,.8);-webkit-transform:rotate(-45deg);right:10px;}
        .tgp-slider .slide-btn-pre:hover:before, .slide-btn-next:hover:before{border-color:#FFFFFF;}
        .tgp-slider .slide-btn-pre.disabled, .slide-btn-next.disabled{background:rgba(0, 0, 0, 0.2);}
        .tgp-slider .slide-btn-pre.disabled:before, .slide-btn-next.disabled:before{opacity:0.5}

        /*thumb缩略图*/
        .tgp-slider .focusthumb-wp{position: relative; width:100%;height:33px;  margin:0 auto;margin-top:-33px; text-align: center;z-index:10;}
        .tgp-slider .focusthumb{width:480px; background:rgba(0, 0, 0, 0.6);
            position:absolute;top:0;left:50%;margin-left:-240px;z-index:10;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-justify-content:space-between;-webkit-box-pack:justify;}
        .tgp-slider .focusthumb a{display:block;height:27px; width:92px;margin:3px; overflow: hidden;}
        .tgp-slider .focusthumb a img{width:100%; height:100%;}
        .tgp-slider .focusthumb .cur, .tgp-slider .focusthumb a:hover{outline:#fff solid 2px;outline-offset: -1px;}

        /*thumb小圆点*/
        .tgp-slider .thumb-dot{display:block; text-align:center; background: none; top:auto;bottom:5px;}
        .tgp-slider .thumb-dot a{width: 8px; height: 8px;display:inline-block; line-height: 8px; border-radius: 50%; background-color: rgba(255,255,255,0.6); margin: 0 2px;}
        .tgp-slider .thumb-dot a:hover{background-color: rgba(255,255,255,0.8);outline: none;outline-offset:0;}
        .tgp-slider .thumb-dot a.cur { background-color: #fff; outline: none;outline-offset:0;}
        .tgp-slider .thumb-dot a img,.tgp-slider .thumb-dot a span{display:none;}

        /*thumb文字*/
        .tgp-slider .thumb-txt{height:33px;line-height: 33px;}
        .tgp-slider .thumb-txt a{width:20%; line-height: 33px; height:33px;margin: 0 3px 0 0;}
        .tgp-slider .thumb-txt a:last-child{margin-right:0;}
        .tgp-slider .thumb-txt a:hover{outline:none; outline-offset:none;   background: rgba(0,0,0,.3);}
        .tgp-slider .thumb-txt a span{color:rgba(255,255,255,.5);white-space: nowrap; overflow: hidden; text-overflow: ellipsis;display: block;
            padding: 0 5px; font-size: 12px; text-align: center;}
        .tgp-slider .thumb-txt a:hover span{color:rgba(255,255,255,.8)}
        .tgp-slider .thumb-txt a.cur,.tgp-slider .thumb-txt a.cur:hover{ background-color:#ee9f41;outline: none;outline-offset:0;}
        .tgp-slider .thumb-txt a.cur span,.tgp-slider .thumb-txt a.cur:hover span{  color:#fff;}
        .tgp-slider .thumb-txt a img{display:none;}
        .tgp-slider .thumb-txt a span{display:inline-block;}

        /*轮播图*/
        .tgp-slider {position: relative;overflow:hidden;height: 100%;width: 100%;}
        .tgp-slider ul{padding:0;margin:0; list-style: none;left:0;top:0;position:relative;width:100%;height:100%;}
        .tgp-slider ul.slider-viewport{position:relative;width:100%;height:100%;}
        .tgp-slider li{padding:0;margin:0;text-align: center;vertical-align: top;position:absolute;}
        .tgp-slider li.left-hider{z-index:1;transform:scale(.6) translate3d(-200%,0, 0);}
        .tgp-slider li.lefter{z-index:3;text-align:left;transform:scale(.8) translate3d(-80%,0, 0);}
        .tgp-slider li.current{z-index:5;transform:scale(1) translate3d(0,0, 0);}
        .tgp-slider li.righter{z-index:3;text-align: right;transform:scale(.8) translate3d(80%,0, 0);}
        .tgp-slider li.right-hider{z-index:1;transform:scale(.6) translate3d(200%,0, 0);}
        .tgp-slider .tgp-figure{display: inline-block; margin: 0 auto;border:none;vertical-align: top;}
         .tgp-slider .tgp-figure:before { box-shadow: none;}

        /***  蒙层  ***/
        .tgp-slider .righter .tgp-figure:after, .tgp-slider  .lefter .tgp-figure:after,.tgp-slider .right-hider .tgp-figure:after,.tgp-slider .left-hider .tgp-figure:after

        {
            content: "";
            background: rgba(0, 0, 0, 0.60);
            z-index: 10;
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            width: 100%;
            height: 100%;
        }
        .tgp-slider .right-hider .tgp-figure:after,.tgp-slider .left-hider .tgp-figure:after{      background: rgba(0, 0, 0, 0.75);}
    `);


    //枚举出所有UI风格对应的class name.
    var CLASS_NAME_CONFIG = {
        "CONTENT" : {
            "single" : 'single',
            "three-cards" : 'slider-3d',
            "five-cards" : 'slider-3d five'
        },
        "NAVIGATOR" : {
            "thumb" : 'focusthumb',
            "disc" : 'focusthumb thumb-dot',
            "title" : 'focusthumb thumb-txt'
        }
    };

    /**
     * 构造器
     * @param wrapper {HTMLElement} 指定的容器
     * @param options {Object}
     * @constructor
     */
    function StaticSlider(wrapper, options){
        //参数
        var _defaults = {

            //主区域UI风格相关
            contentStyles : {
                type : 'single', //3张卡片切换的风格,默认为单张从左往右切换效果
                //config : {      //选定风格的相关特定配置项，
                //    mainCardWidth : 360,
                //    mainCardHeight : 200,
                //}
            },

            //导航栏（如缩略图）UI风格相关
            navStyles : {
                type : 'thumb', //tab切换的风格，默认thumb缩略图模式。可选'none'/'thumb'/'title'/'disc'
                showPrevAndNext : false
            },
            showPrevAndNext : true, //是否展示前后导航的按钮（如果条件满足）

            //轮播执行的相关参数
            autoPlay : true,        //是否自动播放
            pauseOnHoverItem : true,//鼠标hover到item上暂停自动播放
            slideOnHoverNav : false,//鼠标hover到缩略图上时，是否滑到对应item
            startAt : 0,            //初始化展示第几个item，默认第一个
            consistent : true,      //是否首尾相连：最后一个item的next无缝连接第一个位置；默认true。TODO:暂只支持true
            duration : 500,         //轮播过程持续时间
            delay : 3000,           //轮播结束后到下次开始的延迟时间
            easing : 'ease-out',    //翻页切换的timing-function，默认'ease-in',建议不赋值。同css transition-timing-function.，支持自定义cubic-bezier.

            //每个item的公共点击行为，如数据上报等。this为<li>的element
            onItemClick : function(e, item, index){},

            //发生滑动之前的回调
            beforeSlide : function(item, index){},

            //滑动过程中(动画执行过程)
            onSliding : function(){item, index},

            //一个item划过来后，响应的回调
            afterSlide : function(item, index){},

            //轮播项 {Array}.
            items : []
        };

        //基本参数检查
        if(!(wrapper instanceof HTMLElement) || !options.items){
            throw new Error("基本参数校验失败，请检查参数。", options);
        }

        //补齐默认参数
        for(var i in _defaults){
            if(!(i in options)){
                options[i] = _defaults[i];
            }
        }

        if(!("type" in options.navStyles)){
            options.navStyles.type = "thumb";
        }

        this.options = options;

        //TODO:暂时只允许三张卡片类型，后面完善其他类型的
        //options.contentStyles.type = "three-cards";

        this.wrapper = wrapper;

        //当前实例的唯一ID
        this.id = `TGP_slider_${StaticSlider.instances.length + 1}`;

        //定义slider的当前状态（仅内部可写）
        this._status = "stop";

        //当前的索引序号（仅内部可写）
        this._current_index = options.startAt;

        //全局计时器（仅内部可写）, serTimeout的每一次重置都会变更。私有属性，不适宜抛出去
        this._auto_play_timer = 0;

        // 插入动态class（值需要计算或者配置的），非定值。
        var cardWidth = options.contentStyles.config.mainCardWidth;
        insertStyleSheets(`
            #${this.id}.tgp-slider li{transition : ${this.transition_string};left: 50%;margin-left:-${cardWidth/2}px;}
            #${this.id}.tgp-slider .focusthumb{width: ${cardWidth}px;margin-left:-${cardWidth/2}px;}
        `);

        // 根据参数生成基本的html骨架结构
        _make_skeleton(this);

        // html结构初始化后计算几个关键dom节点
        var _wp = $(wrapper);
        this.elements = {
            viewport    : _wp.find('[tag="viewport"]').get(0),
            prevBtn     : _wp.find('[tag="prev"]').get(0),
            nextBtn     : _wp.find('[tag="next"]').get(0),
            navigator   : _wp.find('[tag="nav_area"]').get(0)
        };

        //初始化事件、设置初始值。
        _init(this);

        //一切ready,如果需要自动播放就开始轮播
        if(options.autoPlay){
            this.run();
        }

        StaticSlider.instances.push(this);
    }

    StaticSlider.prototype = {
        /**
         * 还原构造器
         */
        constructor : StaticSlider,

        /**
         * 当前slider实例的唯一标记
         */
        id : '-',

        /**
         * 相关element元素抛出来
         */
        wrapper : null,

        elements : {
            viewport : null,
            prevBtn : null,
            nextBtn : null,
            navigator : null,
        },

        /**
         * slider的当前状态。外部可访问，仅内部可写
         */
        _status : "stop",
        get status(){
            return this._status;
        },

        /**
         * slider的transition属性值。只读
         */
        get transition_string(){
            return `transform ${this.options.duration}ms ${this.options.easing}`;
        },

        /**
         * 全局计时器,serTimeout的每一次重置都会变更。仅内部可读写
         */
        _auto_play_timer : 0,

        /**
         * 轮播数据源的总长度。
         */
        get itemsSize (){
            return this.options.items.length;
        },

        /**
         * 当前主显示的索引号（在items里面的排序序号）
         */
        _current_index : 0,
        get currentIndex (){
            return this._current_index;
        },

        /**
         * 设置其中一个li的数据
         * 支持两种调用方式：setItemData(liA, 2);setItemData([liA, 2], [liB, 3], [liC, 5],...);
         * @param liEle
         * @param itemIndex
         * @returns {StaticSlider}
         */
        setItemData : function (liEle, itemIndex){
            //多项合并模式调用
            if(Array.isArray(arguments[0])){
                var slider = this;
                [].forEach.call(arguments, function(argItem){
                    Array.isArray(argItem) && slider.setItemData.call(slider, ...argItem);
                });
                return this;
            }
            //防止越界
            itemIndex = (itemIndex + this.itemsSize) % this.itemsSize;
            var item = this.options.items[itemIndex];
            //格式是图片或者自定义html
            if(item.image){
                liEle.find('img').attr('src', item.image);
            }else if(item.html){
                liEle.html(item.html);
            }
            //如果是打开目标链接，直接写进href即可。
            var aLink = liEle.children('a').attr("data-index" , itemIndex);
            //console.log(itemIndex, item.target);
            if(item.target){
                aLink.attr({
                    "href" : item.target,
                    "data-type" : 'link'
                });
            }else{
                aLink.attr("data-type", 'event');
            }
            return this;
        },

        /**
         * 设置隐藏的两个边界li的数据，由于已经有currentIndex和li.className来记录当前态，
         * 因此两个侧边的li元素和对应数据都是确定的，不需要传参.
         * @returns {StaticSlider}
         */
        resetHiddenData : function (){
            var viewport = $(this.elements.viewport),
                leftHiddenLi = viewport.find('.left-hider'),
                rightHiddenLi = viewport.find('.right-hider');
            return this.setItemData(
                [leftHiddenLi, this.currentIndex - 2],
                [rightHiddenLi, this.currentIndex + 2]
            );
        },

        /**
         * 开始（继续）执行轮播动作
         * @param {Number} index 从第几帧开始播放，默认从之前停止的索引位置继续
         * @returns {StaticSlider}
         */
        run : function(){
            //console.log("running");
            var slider = this;
            this._status = 'playing';
            this._auto_play_timer = window.setTimeout(function(){
                slider.slideToNext().run();
            }, this.options.delay);
            return this;
        },

        /**
         * 暂停播放
         * @returns {StaticSlider}
         */
        pause : function(){
            window.clearTimeout(this._auto_play_timer);
            this._status = 'pause';
            return this;
        },

        /**
         * 停止（暂停）轮播动作
         * @param reset {Boolean} 是否重置到初始位置
         * @returns {StaticSlider}
         */
        stop : function(reset){
            window.clearTimeout(this._auto_play_timer);
            this._status = 'stop';
            if(reset){
                //TODO: 重置操作
            }
            return this;
        },

        /**
         * 跳转到指定的索引序号(sourceItem#size范围内)
         * @param {Number} index 目标位置，注意，index的值有可能越界，超出itemsSize。动画执行的方向取决于index - currIndex是否>0。
         * @returns {StaticSlider}
         */
        slideTo : function(index){
            !index && (index = 0);
            //console.log(index, this.currentIndex)
            var slider = this;

            if(index === this.currentIndex){
                return this;
            }else{
                var _before = slider.options.beforeSlide;
                if(typeof _before === "function"){
                    _before.call(slider, slider.options.items[slider.currentIndex], slider.currentIndex);
                }
                _move(index - this.currentIndex);
            }

            // 开始执行动画，delta的正负决定方向，大小决定次数。
            // 大于一定向右运动，小于一定向左，由于调用处的约束关系，delta已经不为0
            function _move(delta){
                //如果目标页码比当前值大，那么前进index - this.currentIndex页，否则后退
                var leftHider = getLi('left-hider'),
                    lefter = getLi('lefter'),
                    current = getLi('current'),
                    righter = getLi('righter'),
                    rightHider = getLi('right-hider');

                //console.log("times", times);
                if(delta > 0){//正向（从左往右滑动）
                    //更新私有变量，slider.currentIndex为只读属性
                    slider._current_index = (slider.currentIndex + 1 + slider.itemsSize) % slider.itemsSize;

                    deliver(leftHider, 'right-hider');
                    lefter.removeClass().addClass('left-hider');
                    current.removeClass().addClass('lefter');
                    righter.removeClass().addClass('current');
                    rightHider.removeClass().addClass('righter');

                    //如果中间有多步过渡，嵌套调用函数体；否则就表示当前就到了目标位置，那么判断是否需要执行afterSlide的回调
                    if(delta - 1 > 0){
                        window.setTimeout(_move.bind(null, delta - 1), 100);
                    }else{
                        var _after = slider.options.afterSlide,
                            _index = slider.currentIndex;
                        _after && righter.one('transitionend', function(){
                            _after.call(slider, slider.options.items[_index], _index);
                        });
                    }

                }else if(delta < 0){//反向（从右往左滑动）
                    //更新私有变量，slider.currentIndex为只读属性
                    slider._current_index = (slider.currentIndex - 1 + slider.itemsSize) % slider.itemsSize;

                    leftHider.removeClass().addClass('lefter');
                    lefter.removeClass().addClass('current');
                    current.removeClass().addClass('righter');
                    righter.removeClass().addClass('right-hider');
                    deliver(rightHider, 'left-hider');

                    //如果中间有多步过渡，嵌套调用函数体；否则就表示当前就到了目标位置，那么判断是否需要执行afterSlide的回调
                    if(delta + 1 < 0){
                        window.setTimeout(_move.bind(null, delta + 1), 100);
                    }else{
                        var _after = slider.options.afterSlide,
                            _index = slider.currentIndex;
                        _after && lefter.one('transitionend', function(){
                            _after.call(slider, slider.options.items[_index], _index);
                        });
                    }

                }

                //更新两侧两个隐藏<li>的数据
                slider.resetHiddenData();

                //更新导航栏的当前态UI
                $(slider.elements.navigator)
                    .find("a")
                    .removeClass('cur')
                    .filter(`a[data-index="${slider.currentIndex}"]`)
                    .addClass('cur');

                ////如果配置有afterSlide事件，那么此时触发
                //var _after = slider.options.afterSlide;
                //if(typeof _after === "function"){
                //    _after.call(slider, slider.options.items[slider.currentIndex], slider.currentIndex);
                //}
            }

            //按照classname获取li
            function getLi(className){
                var vp = $(slider.elements.viewport);
                return vp.find(`li.${className}`);
            }

            //将某个li无动画过渡直接变换到另一个状态
            function deliver(jqEle, targetClassName){
                jqEle
                    .css({
                        "transition" : 'none',
                        "visibility" : 'hidden'
                    })
                    .removeClass()
                    .addClass(targetClassName);

                setTimeout(function(){
                    jqEle.css({
                        "transition" : slider.transition_string,
                        "visibility" : 'visible'
                    });
                }, 0);
            }
            return this;
        },

        /**
         * 后退一个单位
         * @returns {StaticSlider}
         */
        slideToPrev : function(){
            return this.slideTo(this.currentIndex - 1);
        },

        /**
         * 前进一个单位
         * @returns {StaticSlider}
         */
        slideToNext : function(){
            return this.slideTo(this.currentIndex + 1);
        }
    };

    //实例集合
    StaticSlider.instances = [];

    //---------------------------------------------------------------------------------

    /**
     * 根据参数生成基本的html骨架结构
     * @private
     */
    function _make_skeleton(slider){
        var options = slider.options;

        var contClassName = CLASS_NAME_CONFIG.CONTENT[options.contentStyles.type],
            navClassName = CLASS_NAME_CONFIG.NAVIGATOR[options.navStyles.type];

        slider.wrapper.innerHTML = `
            <div id="${slider.id}" class="tgp-slider ${contClassName}">
                <div tag="prev" class="slide-btn-pre" style="display: none;" href="#"></div>
                <div tag="next" class="slide-btn-next" style="display: none;" href="#"></div>
                <ul tag="viewport" class="slider-viewport">
                    <li class="left-hider"><a class="tgp-figure" href="#"><img class="ads-img"></a></li>
                    <li class="lefter"><a class="tgp-figure" href="#"><img class="ads-img"></a></li>
                    <li class="current"><a class="tgp-figure" href="#"><img class="ads-img"></a></li>
                    <li class="righter"><a class="tgp-figure" href="#"><img class="ads-img"></a></li>
                    <li class="right-hider"><a class="tgp-figure" href="#"><img class="ads-img"></a></li>
                </ul>
                <div tag="nav_area" class="focusthumb-wp" style="display: none;">
                    <div tag="nav_prev" class="btn-pre" style="display: none;" href="#"></div>
                    <div tag="nav_next" class="btn-next" style="display: none;" href="#"></div>
                    <div tag="nav_viewport" class="${navClassName}" >
                        ${generateThumbs(options)}
                    </div>
                </div>
            </div>`;

        //生成缩略图（如果需要）
        function generateThumbs(options){
            return options.items.map(function(item, index){
                return `
                    <a href="#" hidefocus data-index="${index}">
                        <img src="${item.thumb || item.image}" />
                        <span>${item.title||""}</span>
                    </a>`;
            }).join('');
        }
    }

    /**
     * //初始化（绑定向前向后的点击事件、点击导航栏缩略图跳转、定时轮播等）
     * @private
     */
    function _init(slider){
        var options = slider.options,
            elements = slider.elements;

        //设置初始数据(包含两个隐藏li)
        var currLi = $(elements.viewport).find('.current'),
            currIndex = slider.currentIndex;

        slider.setItemData(
            [currLi,                        currIndex],
            [currLi.siblings(".lefter"),    currIndex - 1],
            [currLi.siblings(".righter"),   currIndex + 1],
            [currLi.siblings(".left-hider"),currIndex - 2],
            [currLi.siblings(".right-hider"),currIndex + 2]
        );

        //设置导航当的当前态
        $(slider.elements.navigator).find(`a[data-index="${currIndex}"]`).addClass('cur');

        //需要展示前进后退箭头按钮，则展示出来，并绑定事件
        if(options.showPrevAndNext){
            var prev = elements.prevBtn,
                next = elements.nextBtn,
                delayThreshold = 300;
            //点击左右导航箭头，防止用户频繁点击，设置了时间阈值(300ms)
            $(prev).show().click(function(){
                slider.stop();
                if(!this.timer){
                    this.timer = 0;
                }
                if(Date.now() - this.timer > delayThreshold){
                    slider.slideToPrev();
                    this.timer = Date.now();
                }
                return false;
            });
            $(next).show().click(function(){
                slider.stop();
                if(!this.timer){
                    this.timer = 0;
                }
                if(Date.now() - this.timer > delayThreshold){
                    slider.slideToNext();
                    this.timer = Date.now();
                }
                return false;
            });
        }

        //如果需要支持hover到item上时暂停播放
        if(options.pauseOnHoverItem){
            $(elements.viewport).bind({
                'mouseenter' : function(){
                    //如果当前正在播放中，那么停止播放，并将状态值改为暂停；如果是非播放状态，则不管。
                    if(slider.status === "playing"){
                        slider.pause();
                    }
                    return false;
                },
                'mouseleave' : function(){
                    //如果当前正在暂停中，那么立即恢复播放。
                    if(slider.status === "pause"){
                        slider.run();
                    }
                    return false;
                }
            });
        }

        //每个item的点击行为处理
        $(slider.elements.viewport).find('li').on('click', 'a', function(e){
            var a = $(this),
                linkType = a.data("type"),
                li = a.closest('li'),
                index = a.data('index')*1,
                item = slider.options.items[index],
                returnValue = false;
            //如果点击到的目标item不处在当前态，那么激活该item
            if(index !== slider.currentIndex){
                slider.slideTo(index);
                return returnValue;
            }
            if(linkType === "link"){
                a.attr({
                    "target" :  '_blank',
                    "href" : item.target
                });
                returnValue = true;
            }else if(linkType === "event"){
                //非外链的形式，就找到绑定的onClick事件执行
                var callback = item && item.onClick;
                callback && callback.call(slider, e, item, li.get(0), index);
                //console.log('onItemClick : index ' + index);
                returnValue = false;
            }
            options.onItemClick && options.onItemClick.call(slider, e, item, index, li.get(0));
            return returnValue;
        });

        //如果需要导航栏，那么点击导航栏栏目，默认slide到对应item
        var nav = options.navStyles,
            navEle = elements.navigator;

        if(nav.type !== 'none'){
            var navPrev = elements.navPrevBtn,
                navNext = elements.navNextBtn;

            //点击导航栏选项，slide到对应的item主界面
            $(navEle).show().on('click', 'a', function(){
                var index = $(this).data("index");
                slider.stop().slideTo(index);
                return false;
            });
            //是否支持鼠标移到nav上就立即slide到对应item上
            if(options.slideOnHoverNav){
                $(navEle).find('a').bind({
                    'mouseenter' : function(){
                        var index = $(this).data("index");
                        slider.stop().slideTo(index);
                        return false;
                    },
                    'mouseleave' : function(){
                        slider.run();
                        return false;
                    },
                });
            }

            if(nav.showPrevAndNext){
                $(navPrev).show().click(function(){
                    slider.slideToPrev();
                });
                $(navNext).show().click(function(){
                    slider.slideToNext();
                });
            }
        }
    }

    /**
     * 动态插入CSS工具方法
     * @param stylesheetCSString {String} <style>元素的内容
     */
    function insertStyleSheets(stylesheetCSString){
        stylesheetCSString += '/**************** generate by TGP#slider *****************/\r\n\r\n\r\n';
        var styleEle = document.querySelector("#___TGP_StaticSlider");
        if(styleEle){
            styleEle.appendChild(document.createTextNode(stylesheetCSString));
        }else{
            styleEle = document.createElement('style');
            styleEle.type = "text/css";
            styleEle.media = 'screen';
            styleEle.id = "___TGP_StaticSlider";
            styleEle.appendChild(document.createTextNode(stylesheetCSString));
            document.getElementsByTagName('head')[0].appendChild(styleEle);
        }
    }

    //---------------------------------------------------------------------------------

    //兼容模块化写法
    if(typeof define === "function" && (define.cmd||define.amd)){
        define(function (require, exports, module) {
            return StaticSlider;
        });
    }else{
        window.StaticSlider = StaticSlider;
    }
})(window);


