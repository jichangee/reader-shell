import blessed from "blessed";
import wcwidth from "wcwidth";
import chalk from "chalk";
import { parseEpub } from "./epubReader.js";
import path from "path";
import { getBookProgress, setBookProgress } from "./progressStore.js";

// 默认字体颜色
let fontColor = "white";
const colorFns = {
  white: chalk.white,
  green: chalk.green,
  cyan: chalk.cyan,
  magenta: chalk.magenta,
  yellow: chalk.yellow,
};

async function startReader(epubPath) {
  const chapters = await parseEpub(epubPath);
  let currentChapter = getBookProgress(epubPath);

  blessed.unicode.wcwidth = wcwidth;
  // 创建blessed屏幕
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: "node",
  });

  // 掩人耳目，假装在开发
  const boss = blessed.box({
    top: 0,
    left: 0,
    width: "100%",
    height: "80%",
    border: "none",
    content: ` @ multi (webpack)-dev-server/client?http://192.168.0.189:8081/sockjs-node (webpack)/hot/dev-server.js ./src/main.js

 warning  in ./src/pagesActive/slotMachine/index5.vue?vue&type=template&id=6430da5c&scoped=true&

Module Warning (from ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js):
(Emitted value instead of an instance of Error) <v-uni-view v-for="label in item.label">: component lists rendered with v-for should have explicit keys. See https://vuejs.org/guide/list.html#key for more info.

 @ ./src/pagesActive/slotMachine/index5.vue?vue&type=template&id=6430da5c&scoped=true& 1:0-701 1:0-701
 @ ./src/pagesActive/slotMachine/index5.vue
 @ ./src/pages.json
 @ ./src/main.js
 @ multi (webpack)-dev-server/client?http://192.168.0.189:8081/sockjs-node (webpack)/hot/dev-server.js ./src/main.js
  @ multi (webpack)-dev-server/client?http://192.168.0.189:8081/sockjs-node (webpack)/hot/dev-server.js ./src/main.js

 warning  in ./src/pagesActive/slotMachine/index5.vue?vue&type=template&id=6430da5c&scoped=true&

Module Warning (from ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js):
(Emitted value instead of an instance of Error) <v-uni-view v-for="label in item.label">: component lists rendered with v-for should have explicit keys. See https://vuejs.org/guide/list.html#key for more info.

 @ ./src/pagesActive/slotMachine/index5.vue?vue&type=template&id=6430da5c&scoped=true& 1:0-701 1:0-701
 @ ./src/pagesActive/slotMachine/index5.vue
 @ ./src/pages.json
 @ ./src/main.js
 @ multi (webpack)-dev-server/client?http://192.168.0.189:8081/sockjs-node (webpack)/hot/dev-server.js ./src/main.js`
 
  });

  // 章节内容框
  const box = blessed.box({
    top: "70%",
    left: 0,
    width: "300",
    height: "30%",
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    focused: true,
    mouse: true,
    vi: true,
    border: "none",
    style: {
      fg: fontColor,
      border: { fg: "cyan" },
    },
  });

  // 状态栏
  const status = blessed.box({
    bottom: 0,
    left: 0,
    width: "100%",
    height: "10%",
    tags: true,
    style: { fg: fontColor },
  });
  screen.append(boss);
  screen.append(box);
  screen.append(status);

  function render() {
    const colorFn = colorFns[fontColor] || chalk.white;
    box.setContent(colorFn(chapters[currentChapter] || ""));
    status.setContent(
      `progress: ${currentChapter + 1}/${
        chapters.length
      }  |  ←/h:prev  →/l:next  c:color  q:exit`
    );
    screen.render();
  }

  // 快捷键
  screen.key(["right", "l"], () => {
    if (currentChapter < chapters.length - 1) {
      currentChapter++;
      setBookProgress(epubPath, currentChapter);
      render();
    }
  });
  screen.key(["left", "h"], () => {
    if (currentChapter > 0) {
      currentChapter--;
      setBookProgress(epubPath, currentChapter);
      render();
    }
  });
  screen.key(["c"], () => {
    // 切换字体颜色
    const colors = ["white", "green", "cyan", "magenta", "yellow"];
    const idx = colors.indexOf(fontColor);
    fontColor = colors[(idx + 1) % colors.length];
    box.style.fg = fontColor;
    render();
  });
  screen.key(["q", "C-c"], () => {
    setBookProgress(epubPath, currentChapter);
    process.exit(0);
  });

  render();
}

// 允许命令行直接运行
const epubPath = process.argv[2];
if (!epubPath) {
  console.error("用法: node src/ui.js <epub文件路径>");
  process.exit(1);
}
startReader(path.resolve(epubPath));
