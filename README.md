# tieba-old-enhancer

百度贴吧旧版界面（电脑端）增强脚本集合。以用户脚本（UserScript）形式发布，需配合油猴（Tampermonkey）等脚本管理器使用。

## 脚本列表

| 脚本 | 版本 | 说明 |
|------|------|------|
| [tieba-long-image-auto-expand.user.js](tieba-long-image-auto-expand.user.js) | 0.1.0 | 帖子中的长图默认只显示前 500px，需要点击"展开"才能看完整。本脚本加载后自动把所有长图展开为完整图片，免去手动点击，并监听 AJAX 动态加载的楼层 |

## 安装方法

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/)（油猴）扩展
2. 打开脚本安装地址：
   `https://raw.githubusercontent.com/1275389313/tieba-old-enhancer/main/tieba-long-image-auto-expand.user.js`
3. 或：油猴管理面板 →「实用工具」→「从 URL 安装」→ 粘贴上述链接
4. 点击「安装」即可，访问旧版贴吧帖子页（`https://tieba.baidu.com/p/*`）自动生效

> 注意：脚本 `@match` 仅匹配旧版贴吧页面（`tieba.baidu.com/p/*`），新版贴吧界面不保证生效。

## 许可

本项目遵循 [MIT](LICENSE) 开源许可证。