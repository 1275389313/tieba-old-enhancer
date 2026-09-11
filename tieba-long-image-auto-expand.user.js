// ==UserScript==
// @name         贴吧旧版长图自动展开
// @namespace    https://github.com/yourname/tieba-long-image-auto-expand
// @version      0.3.1
// @description  百度贴吧电脑端旧版:①自动展开长图为完整图片;②自动展开全部楼中楼回复;③隐藏页面右侧推广/辅助按钮(辅助模式、下载APP、魔法道具、神来一句、分享、我要反馈)及"爱逛的吧"模块。免去手动点击。
// @author       you
// @match        https://tieba.baidu.com/p/*
// @run-at       document-end
// @grant        none
// @license      MIT
// @updateURL    https://cdn.jsdelivr.net/gh/1275389313/tieba-old-enhancer@main/tieba-long-image-auto-expand.meta.js
// @downloadURL  https://cdn.jsdelivr.net/gh/1275389313/tieba-old-enhancer@main/tieba-long-image-auto-expand.user.js
// ==/UserScript==

(function () {
    'use strict';

    // 结构(旧版贴吧长图折叠):
    // <div class="d_post_content j_d_post_content" id="post_content_xxx">
    //     <div class="replace_div" style="width:560px">
    //         <div class="replace_tip"><i class="icon-expand"></i>点击展开，查看完整图片</div>
    //         <img class="BDE_Image" src="..." width="560" height="1244">
    //     </div>
    // </div>
    // 折叠原理:.replace_div 高度固定 500px + overflow:hidden,把高图裁掉,底部盖提示条。
    // 手动点击后:.replace_div 高度变为 auto,div.replace_tip 被隐藏。
    // 本脚本做的就是替用户自动完成这两步,并监听 AJAX 动态加载的楼层。

    // 结构(旧版贴吧楼中楼折叠):
    // <div class="j_lzl_container core_reply_wrapper">
    //     <ul class="lzl_list">
    //         <li class="lzl_single_post">...(前 5 条回复直接渲染)...</li>
    //         <li class="lzl_li_pager">
    //             <span class="lzl_items">...</span>
    //             <a class="post_btn_wrap j_lzl_m">查看更多回复</a>
    //         </li>
    //     </ul>
    // </div>
    // 折叠原理:回复数超过 5 条时,剩余回复不随页面渲染,只保留一个"查看更多回复"入口(a.j_lzl_m)。
    // 手动点击后:贴吧发起 AJAX 请求,把剩余回复插入楼中楼列表,然后移除该入口。
    // 本脚本做的就是自动点击入口,由贴吧自身完成剩余回复的加载与渲染。

    const processed = new WeakSet();
    const replied = new WeakSet();

    // 展开一个长图容器。只处理包含图片的 replace_div,避免误伤贴吧其他"替换"用途的元素。
    function expand(container) {
        if (!container || !(container instanceof Element) || processed.has(container)) {
            return;
        }
        // 仅对里面确实有帖内图片的容器生效
        const img = container.querySelector('img.BDE_Image');
        if (!img) {
            return;
        }
        processed.add(container);

        // 复刻官方点击展开的行为:内联 height:auto 覆盖样式表的固定 500px
        container.style.height = 'auto';
        container.style.overflow = 'visible';

        // 隐藏"点击展开"提示条
        const tip = container.querySelector('div.replace_tip');
        if (tip) {
            tip.style.display = 'none';
        }
    }

    // 自动点击"查看更多回复"入口,让贴吧自行加载并渲染剩余楼中楼回复。
    // 点击后该入口会被贴吧从 DOM 移除,下次扫描自然不会再遇到;用 WeakSet 兜底,防止对同一入口重复点击。
    function expandReplies() {
        document.querySelectorAll('a.j_lzl_m').forEach((link) => {
            if (replied.has(link)) {
                return;
            }
            replied.add(link);
            link.click();
        });
    }

    // 结构(旧版贴吧右侧工具条):
    // <ul class="tbui_aside_float_bar">  (悬浮在页面右侧)
    //     <li class="tbui_aside_fbar_button tbui_fbar_auxiliaryCare"><a>辅助模式</a></li>
    //     <li class="tbui_aside_fbar_button tbui_fbar_down"><a>下载APP</a></li>
    //     <li class="tbui_aside_fbar_button tbui_fbar_props"><a>魔法道具</a></li>
    //     <li class="tbui_aside_fbar_button tbui_fbar_tsukkomi"><a>神来一句</a></li>
    //     <li class="tbui_aside_fbar_button tbui_fbar_share"><a>分享</a></li>
    //     <li class="tbui_aside_fbar_button tbui_fbar_feedback"><a href="/pmc/feedback">我要反馈</a></li>
    //     ...(返回顶部等保留)
    // </ul>
    // 右侧栏另有"下载APP"推广块 div.app_download_box,与悬浮条下载按钮一并隐藏。

    // 需要隐藏的右侧悬浮条按钮(按贴吧固定 class 定位,按钮图标由纯 CSS 绘制,无文字节点)
    const FBAR_HIDDEN = [
        'tbui_fbar_auxiliaryCare', // 辅助模式
        'tbui_fbar_down',          // 下载APP
        'tbui_fbar_props',         // 魔法道具
        'tbui_fbar_tsukkomi',      // 神来一句
        'tbui_fbar_share',         // 分享
        'tbui_fbar_feedback',      // 我要反馈
    ];

    // 隐藏右侧推广/辅助按钮与"爱逛的吧"模块
    function hideSidebar() {
        // 悬浮工具条上的按钮
        FBAR_HIDDEN.forEach((cls) => {
            document.querySelectorAll('ul.tbui_aside_float_bar li.' + cls).forEach((li) => {
                li.style.display = 'none';
            });
        });

        // 右侧栏"下载APP"推广块
        document.querySelectorAll('div.app_download_box').forEach((box) => {
            box.style.display = 'none';
        });

        // "爱逛的吧"模块按需渲染,class 不稳定,改用标题文本定位其模块容器
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                // 包含匹配,兼容标题文本带空格等其他排版字符的情况
                return (node.textContent || '').includes('爱逛的吧')
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            },
        });
        let textNode;
        while ((textNode = walker.nextNode())) {
            // 优先向上查找带右侧栏特征的模块容器;找不到就隐藏标题所在 li 或向上两层的模块包装
            let el = textNode.parentElement;
            let container = null;
            for (let i = 0; el && i < 6; i++) {
                const cls = typeof el.className === 'string' ? el.className.toLowerCase() : '';
                if (/(right|aside|side|bright)/.test(cls + ' ' + (el.id || ''))) {
                    container = el;
                    break;
                }
                el = el.parentElement;
            }
            const target = container
                || textNode.parentElement.closest('li, div, dl')
                || textNode.parentElement.parentElement;
            if (target) {
                target.style.display = 'none';
            }
        }
    }

    function scan() {
        // replace_div 可能出现在主楼/回复楼,以及楼中楼里,统一定位
        document.querySelectorAll('div.d_post_content div.replace_div').forEach(expand);
        expandReplies();
        hideSidebar();
    }

    // 首次扫描
    scan();

    // 贴吧翻页/滚动加载新楼层时,继续处理后出现的长图
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
