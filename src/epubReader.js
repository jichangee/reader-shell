import EPub from 'epub';

/**
 * 解析epub文件，返回章节文本数组
 * @param {string} epubPath epub文件路径
 * @returns {Promise<string[]>} 章节文本数组
 */
function parseEpub(epubPath) {
    return new Promise((resolve, reject) => {
        const epub = new EPub(epubPath);
        epub.on('error', reject);
        epub.on('end', function() {
            const chapterIds = epub.flow.map(ch => ch.id);
            const chapters = [];
            let loaded = 0;
            chapterIds.forEach((id, idx) => {
                epub.getChapterRaw(id, (err, data) => {
                    if (err) {
                        chapters[idx] = '';
                    } else {
                        let text = data.toString('utf-8');
                        chapters[idx] = text.replace(/<[^>]+>/g, '') + '\n\n 本章完';
                    }
                    loaded++;
                    if (loaded === chapterIds.length) {
                        resolve(chapters);
                    }
                });
            });
        });
        epub.parse();
    });
}

export { parseEpub };
