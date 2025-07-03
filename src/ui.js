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
  const progress = getBookProgress(epubPath);
  let currentChapter = (progress && progress.chapter) || 0;
  let currentScroll = (progress && progress.scroll) || 0;

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

 `
 
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
      }  |  ←/w:prev  →/e:next ↑/s:up ↓/d:down  a:boss  q:exit`
    );
    // 恢复滚动位置
    box.setScroll(currentScroll);
    screen.render();
  }

  function saveProgress() {
    setBookProgress(epubPath, { chapter: currentChapter, scroll: box.getScroll() - 1 });
  }

  // 快捷键
  screen.key(["right", "e"], () => {
    if (currentChapter < chapters.length - 1) {
      currentChapter++;
      currentScroll = 0;
      saveProgress();
      render();
    }
  });
  screen.key(["left", "w"], () => {
    if (currentChapter > 0) {
      currentChapter--;
      currentScroll = 0;
      saveProgress();
      render();
    }
  });
  screen.key(["up", "s"], () => {
    currentScroll--;
    render();
  });
  screen.key(["down", "d"], () => {
    currentScroll++;
    render();
  });
  screen.key(["a"], () => {
    // 老板键
    if (box.height === 0) {
      boss.height = '80%'
      box.height = '30%'
      status.height = '10%'
    } else {
      boss.height = '100%'
      box.height = 0
      status.height = 0
    }
    render()
  });
  screen.key(["q", "C-c"], () => {
    saveProgress();
    process.exit(0);
  });

  box.on('scroll', () => {
    currentScroll = box.getScroll();
    saveProgress();
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
