# html2blog.js
爬取一个 HTML 页面，自动生成 Hexo 等静态博客软件可读的文件格式并转换图片为 webp

## 注意
主要针对 WordPress ，且部分逻辑针对特定 WordPress 插件（[Syntax-highlighting Code Block (with Server-side Rendering)](https://cn.wordpress.org/plugins/syntax-highlighting-code-block/)），请在使用之前修改 `generate.js` 内部逻辑

## 使用
```bash
npm install
node html2blog -u <爬取的链接> -f <输出的博客文件> -p <图片文件前缀>
```
生成的文件可以在 output/ 看到。

## 关于 图片文件前缀
程序会自动改写 HTML 内 `<img>` 标签的 `src` 为 `/<前缀>/<前缀>-<序号>.webp` （默认值） ,并遵循此路径储存。  
你也可以在 config.toml 里自定义图片路径

## 配置
<a href="/config.toml"><code>config.toml</code></a> 内一目了然。

## 拓展阅读
* https://github.com/University-Of-Fool/md2wp.py) - 从 Markdown 文件生成 WordPress 页面

## LICENSE
MIT。
