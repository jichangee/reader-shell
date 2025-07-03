import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_PATH = path.join(__dirname, '../progress.json');

function loadProgress() {
    if (!fs.existsSync(STORE_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    } catch (e) {
        return {};
    }
}

function saveProgress(progress) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

function getBookProgress(bookPath) {
    const progress = loadProgress();
    const val = progress[bookPath];
    if (typeof val === 'number') {
        // 兼容旧数据
        return { chapter: val, scroll: 0 };
    }
    return val || { chapter: 0, scroll: 0 };
}

function setBookProgress(bookPath, obj) {
    const progress = loadProgress();
    progress[bookPath] = obj;
    saveProgress(progress);
}

export {
    getBookProgress,
    setBookProgress
}; 