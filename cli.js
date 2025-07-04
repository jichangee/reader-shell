#!/usr/bin/env node
import { startReader } from './src/ui.js';
import path from 'path';
const epubPath = process.argv[2];
if (!epubPath) {
  console.error('用法: reader-shell <epub文件路径>');
  process.exit(1);
}
startReader(path.resolve(epubPath));