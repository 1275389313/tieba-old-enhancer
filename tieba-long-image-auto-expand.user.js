// ==UserScript==
// @name         贴吧旧版长图自动展开
// @namespace    https://github.com/yourname/tieba-long-image-auto-expand
// @version      0.1.0
// @description  百度贴吧电脑端旧版:帖子里的长图默认只显示前 500px,需要点击"展开"才能看完整。本脚本加载后自动把所有长图展开为完整图片,免去手动点击。
// @author       you
// @match        https://tieba.baidu.com/p/*
// @run-at       document-end
// @grant        none
// @license      MIT
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

    const processed = new WeakSet();

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

    function scan() {
        // replace_div 可能出现在主楼/回复楼,以及楼中楼里,统一定位
        document.querySelectorAll('div.d_post_content div.replace_div').forEach(expand);
    }

    // 首次扫描
    scan();

    // 贴吧翻页/滚动加载新楼层时,继续处理后出现的长图
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();