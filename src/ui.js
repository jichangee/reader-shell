import blessed from "blessed";
import chalk from "chalk";
import { parseEpub } from "./epubReader.js";
import path from "path";
import { getBookProgress, setBookProgress } from "./progressStore.js";
import { config } from "./config.js";
import fs from 'fs';

// 默认字体颜色
let fontColor = config.fontColor;
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

  // 创建blessed屏幕
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: config.title,
  });

  // 掩人耳目，假装在开发
  const boss = blessed.box({
    top: 0,
    left: 0,
    width: "100%",
    height: "80%",
    border: "none",
    content: config.bossContent
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

  // 用于跟踪当前显示的章节，避免重复设置相同内容
  let lastDisplayedChapter = -1;

  function render(forceContentRefresh = false) {
    const colorFn = colorFns[fontColor] || chalk.white;

    // 只有当章节改变或强制刷新时才重新设置内容
    if (forceContentRefresh || lastDisplayedChapter !== currentChapter) {
      box.setContent(colorFn(chapters[currentChapter] || ""));
      lastDisplayedChapter = currentChapter;
    }

    status.setContent(
      `progress: ${currentScroll}/${box.getScrollHeight()}  |  chapter: ${currentChapter + 1}/${
        chapters.length
      }  |  ←/w:prev →/e:next ↑/s:up ↓/d:down a:boss q:exit`
    );
    // 恢复滚动位置
    box.setScroll(currentScroll);
    screen.render();
  }

  function saveProgress() {
    setBookProgress(epubPath, { chapter: currentChapter, scroll: currentScroll });
  }

  function changeChapter(chapter) {
    currentChapter += chapter;
    currentScroll = 0;
    saveProgress();
    render(true); // 切换章节时强制刷新内容
  }

  // 快捷键
  screen.key(["right", "e"], () => {
    if (currentChapter < chapters.length - 1) {
      changeChapter(1)
    }
  });
  screen.key(["left", "w"], () => {
    if (currentChapter > 0) {
      changeChapter(-1)
    }
  });
  screen.key(["up", "s"], () => {
    currentScroll--;
    if (currentScroll < 0) {
      changeChapter(-1)
      return
    }
    render();
  });
  screen.key(["down", "d"], () => {
    currentScroll++;
    if (currentScroll > box.getScrollHeight()) {
      changeChapter(1)
      return
    }
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
    render(false) // 老板键切换时不强制刷新内容
  });
  screen.key(["q", "C-c"], () => {
    saveProgress();
    process.exit(0);
  });

  box.on('scroll', () => {
    saveProgress();
  });

  render(true); // 初始渲染时强制设置内容
}

// 允许命令行直接运行
const epubPath = process.argv[2];
if (!epubPath) {
  console.error("用法: node src/ui.js <epub文件路径>");
  process.exit(1);
}
startReader(path.resolve(epubPath));

export { startReader };