#!/usr/bin/env node
import { startReader } from './src/ui.js';
import path from 'path';
const filePath = process.argv[2];
if (!filePath) {
  console.error('用法: reader-shell <文件路径>');
  process.exit(1);
}
startReader(path.resolve(filePath));