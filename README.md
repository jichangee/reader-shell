# 终端电子书阅读器

一个基于 Node.js 的终端电子书阅读器，支持导入 epub 文件、记住阅读进度、快捷键翻页和字体颜色切换。

![reader-shell-demo.gif?raw=true](https://cdn.jsdelivr.net/gh/jichangee/gallery@master/imgur/reader-shell-demo.gif?raw=true)

## 功能特性

- 支持导入 epub 电子书
- 记住每本书的阅读进度（包括章节和章节内滚动位置）
- 支持快捷键翻页、章节内滚动
- 支持老板键一键隐藏内容
- 纯终端操作，跨平台

## 安装依赖

```bash
npm install
```

## 使用方法

```bash
node src/ui.js <你的电子书.epub>
```

例如：

```bash
node src/ui.js ./books/三体.epub
```

全局终端

```bash
npm install -g
```

```bash
reader-shell /path/to/your/ebook.epub
```

## 快捷键说明

- `→` 或 `e`：下一章
- `←` 或 `w`：上一章
- `↑` 或 `s`：章节内向上滚动
- `↓` 或 `d`：章节内向下滚动
- `a`：老板键（快速隐藏/恢复内容）
- `q` 或 `Ctrl+C`：退出阅读器

## 进度存储

- 阅读进度会自动保存在 `progress.json` 文件中，每本书独立记录。
- 记忆内容包括：当前章节、章节内滚动位置。

## 常见问题

- **中文乱码**：已内置 HTML 实体解码和编码处理，绝大多数 epub 可正常显示中文。
- **终端不显示中文**：请确保终端编码为 `UTF-8`，并使用支持中文的字体。

## 依赖说明

- [epub](https://www.npmjs.com/package/epub) 电子书解析
- [blessed](https://www.npmjs.com/package/blessed) 终端 UI
- [chalk](https://www.npmjs.com/package/chalk) 终端字体颜色

## 许可协议

MIT
