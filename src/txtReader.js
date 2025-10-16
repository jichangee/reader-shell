import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

/**
 * 检测文件编码
 * @param {Buffer} buffer 文件内容
 * @returns {string} 编码名称
 */
function detectEncoding(buffer) {
    // 检查BOM标记
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return 'utf8';
    }

    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        return 'utf16le';
    }

    if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
        return 'utf16be';
    }

    // 简单的编码检测：尝试UTF-8解码
    try {
        const utf8Content = buffer.toString('utf8');
        // 检查是否包含UTF-8无效字符
        if (!utf8Content.includes('�')) {
            return 'utf8';
        }
    } catch (e) {
        // UTF-8解码失败，尝试其他编码
    }

    // 尝试GBK/GB2312编码（中文Windows常用编码）
    try {
        const gbkContent = iconv.decode(buffer, 'gbk');
        // 检查解码是否成功（没有太多乱码字符）
        if (!gbkContent.includes('�') || gbkContent.indexOf('�') / gbkContent.length < 0.1) {
            return 'gbk';
        }
    } catch (e) {
        // GBK解码失败
    }

    // 默认使用UTF-8
    return 'utf8';
}

/**
 * 以正确的编码读取文件
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} 文件内容
 */
function readFileWithCorrectEncoding(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                reject(err);
                return;
            }

            const encoding = detectEncoding(buffer);
            let content;

            try {
                if (encoding === 'utf8') {
                    content = buffer.toString('utf8');
                } else {
                    content = iconv.decode(buffer, encoding);
                }
                resolve(content);
            } catch (e) {
                // 如果指定编码解码失败，尝试UTF-8
                try {
                    content = buffer.toString('utf8');
                    resolve(content);
                } catch (utf8Err) {
                    reject(new Error(`无法解码文件，尝试的编码: ${encoding}`));
                }
            }
        });
    });
}

/**
 * 解析txt文件，返回章节文本数组
 * @param {string} txtPath txt文件路径
 * @returns {Promise<string[]>} 章节文本数组
 */
function parseTxt(txtPath) {
    return new Promise((resolve, reject) => {
        readFileWithCorrectEncoding(txtPath).then(data => {
            let content = data;
            let chapters = [];

            // 先尝试按明确的章节标题分割
            const lines = content.split('\n');
            let currentChapter = '';
            let chapterHeaders = [];

            // 寻找所有章节标题的行号
            lines.forEach((line, index) => {
                if (/^第[一二三四五六七八九十百千万0-9]+[章节]/.test(line.trim())) {
                    chapterHeaders.push(index);
                }
            });

            if (chapterHeaders.length > 1) {
                // 按找到的章节标题分割
                for (let i = 0; i < chapterHeaders.length; i++) {
                    const startLine = chapterHeaders[i];
                    const endLine = i < chapterHeaders.length - 1 ? chapterHeaders[i + 1] : lines.length;

                    const chapterLines = lines.slice(startLine, endLine);
                    const chapterContent = chapterLines.join('\n').trim();

                    if (chapterContent.length > 0) {
                        chapters.push(chapterContent);
                    }
                }
            }

            // 如果没有找到章节分割，按段落分割
            if (chapters.length === 0) {
                // 按多个空行分割
                const sections = content.split(/\n\s*\n\s*\n/);
                chapters = sections.filter(section => section.trim().length > 0);

                // 如果分割后章节太少，按单个空行分割，然后每10个段落合并
                if (chapters.length <= 1) {
                    const paragraphs = content.split(/\n\s*\n/);
                    chapters = [];
                    const chapterSize = 10;
                    for (let i = 0; i < paragraphs.length; i += chapterSize) {
                        const chapter = paragraphs.slice(i, i + chapterSize).join('\n\n');
                        if (chapter.trim().length > 0) {
                            chapters.push(chapter);
                        }
                    }
                }
            }

            // 如果还是没有合适的章节，整个文件作为一章
            if (chapters.length === 0) {
                chapters = [content];
            }

            // 清理每章内容
            chapters = chapters.map(chapter => {
                return chapter
                    .replace(/\r\n/g, '\n')  // 统一换行符
                    .replace(/\n{3,}/g, '\n\n')  // 去除多余的空行
                    .replace(/\s+/g, '')  // 删除所有空格和换行
                    .trim();
            }).filter(chapter => chapter.length > 0);

            resolve(chapters);
        }).catch(err => {
            reject(err);
        });
    });
}

export { parseTxt, detectEncoding, readFileWithCorrectEncoding };