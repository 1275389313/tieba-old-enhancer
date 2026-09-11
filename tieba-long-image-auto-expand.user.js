// ==UserScript==
// @name         贴吧旧版长图自动展开
// @namespace    https://github.com/yourname/tieba-long-image-auto-expand
// @version      0.2.0
// @description  百度贴吧电脑端旧版:①帖子里的长图默认只显示前 500px,需要点击"展开"才能看完整,脚本自动把所有长图展开为完整图片;②楼中楼回复超过 5 条后默认不显示,脚本自动点击"查看更多回复",将全部回复展开,免去手动点击。
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

    function scan() {
        // replace_div 可能出现在主楼/回复楼,以及楼中楼里,统一定位
        document.querySelectorAll('div.d_post_content div.replace_div').forEach(expand);
        expandReplies();
    }

    // 首次扫描
    scan();

    // 贴吧翻页/滚动加载新楼层时,继续处理后出现的长图
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();