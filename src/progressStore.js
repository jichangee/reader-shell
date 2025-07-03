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
    return progress[bookPath] || 0;
}

function setBookProgress(bookPath, chapterIdx) {
    const progress = loadProgress();
    progress[bookPath] = chapterIdx;
    saveProgress(progress);
}

export {
    getBookProgress,
    setBookProgress
}; 