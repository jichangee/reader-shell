# 终端电子书阅读器

一个基于 Node.js 的终端电子书阅读器，支持导入 epub 文件、记住阅读进度、快捷键翻页和字体颜色切换。

## 功能特性
- 支持导入 epub 电子书
- 记住每本书的阅读进度
- 支持快捷键翻页（上一章/下一章）
- 支持切换字体颜色
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

## 快捷键说明
- `→` 或 `l`：下一章
- `←` 或 `h`：上一章
- `c`：切换字体颜色
- `q` 或 `Ctrl+C`：退出阅读器

## 进度存储
- 阅读进度会自动保存在 `progress.json` 文件中，每本书独立记录。

## 常见问题
- **中文乱码**：已内置 HTML 实体解码和编码处理，绝大多数 epub 可正常显示中文。
- **终端不显示中文**：请确保终端编码为 `UTF-8`，并使用支持中文的字体。

## 依赖说明
- [epub](https://www.npmjs.com/package/epub) 电子书解析
- [blessed](https://www.npmjs.com/package/blessed) 终端 UI
- [chalk](https://www.npmjs.com/package/chalk) 终端字体颜色
- [he](https://www.npmjs.com/package/he) HTML 实体解码
- [iconv-lite](https://www.npmjs.com/package/iconv-lite) 编码转码（如需）

## 许可协议
MIT 