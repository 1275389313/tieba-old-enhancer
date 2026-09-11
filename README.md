# tieba-old-enhancer

百度贴吧旧版界面（电脑端）增强脚本集合。以用户脚本（UserScript）形式发布，需配合油猴（Tampermonkey）等脚本管理器使用。

## 脚本列表

| 脚本 | 版本 | 说明 |
|------|------|------|
| [tieba-long-image-auto-expand.user.js](tieba-long-image-auto-expand.user.js) | 0.3.0 | ① 自动展开长图为完整图片；② 自动展开全部楼中楼回复（免点"查看更多回复"）；③ 隐藏页面右侧推广/辅助按钮（辅助模式、下载APP、魔法道具、神来一句、分享）及"爱逛的吧"模块，并监听 AJAX 动态加载的楼层 |

## 安装方法

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（油猴）扩展
2. 打开脚本安装地址：
   `https://raw.githubusercontent.com/1275389313/tieba-old-enhancer/main/tieba-long-image-auto-expand.user.js`
3. 或：油猴管理面板 →「实用工具」→「从 URL 安装」→ 粘贴上述链接
4. 点击「安装」即可，访问旧版贴吧帖子页（`https://tieba.baidu.com/p/*`）自动生效

> 注意：脚本 `@match` 仅匹配旧版贴吧页面（`tieba.baidu.com/p/*`），新版贴吧界面不保证生效。

## 自动更新

脚本已声明 `@updateURL` / `@downloadURL`（指向 jsDelivr CDN，国内可直接访问），油猴会按设置的更新周期自动检查版本号（`@version`）变化，发现新版本后提示更新；也可以随时在油猴菜单栏点击脚本检查更新。发布新版本时只需修改 `@version` 号并推送仓库即可。

## 许可

本项目遵循 [MIT](LICENSE) 开源许可证。
