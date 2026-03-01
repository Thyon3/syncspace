import React from 'react';

/**
 * Parses message text for basic markdown-like syntax:
 * **bold** -> <b>
 * *italic* or _italic_ -> <i>
 * `code` -> <code>
 * [link](url) -> <a>
 * @param {string} text 
 * @returns {React.ReactNode}
 */
export const parseRichText = (text) => {
    if (!text) return text;

    // Handle bold: **text**
    let parts = [text];

    // Bold: **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    parts = flatten(parts.map(part => {
        if (typeof part !== 'string') return part;
        const matches = part.split(boldRegex);
        return matches.map((m, i) => i % 2 === 1 ? <strong key={`b-${i}`} className="font-bold">{m}</strong> : m);
    }));

    // Italic: *text* or _text_
    const italicRegex = /[\*_](.*?)[\*_]/g;
    parts = flatten(parts.map(part => {
        if (typeof part !== 'string') return part;
        const matches = part.split(italicRegex);
        return matches.map((m, i) => i % 2 === 1 ? <em key={`i-${i}`} className="italic">{m}</em> : m);
    }));

    // Code: `text`
    const codeRegex = /`(.*?)`/g;
    parts = flatten(parts.map(part => {
        if (typeof part !== 'string') return part;
        const matches = part.split(codeRegex);
        return matches.map((m, i) => i % 2 === 1 ? <code key={`c-${i}`} className="bg-black/30 px-1 rounded font-mono text-sm mix-blend-screen">{m}</code> : m);
    }));

    // Links: [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    parts = flatten(parts.map(part => {
        if (typeof part !== 'string') return part;
        const res = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(part)) !== null) {
            res.push(part.substring(lastIndex, match.index));
            res.push(
                <a
                    key={`l-${match.index}`}
                    href={match[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-telegram-blue hover:underline break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {match[1]}
                </a>
            );
            lastIndex = linkRegex.lastIndex;
        }
        res.push(part.substring(lastIndex));
        return res;
    }));

    return parts;
};

const flatten = (arr) => arr.reduce((acc, val) => acc.concat(val), []);
