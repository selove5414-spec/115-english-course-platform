const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filePath = path.join(__dirname, '課程及科務安排', '115(1)行事曆_0724.pdf');
const buf = fs.readFileSync(filePath);
const str = buf.toString('latin1');

// Find all object streams
const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let m;
let textOut = [];

while ((m = streamRegex.exec(str)) !== null) {
  const streamBuf = Buffer.from(m[1], 'latin1');
  let decompressed;
  try {
    decompressed = zlib.inflateSync(streamBuf);
  } catch (e) {
    try {
      decompressed = zlib.inflateRawSync(streamBuf);
    } catch (e2) {
      decompressed = streamBuf;
    }
  }

  const textStr = decompressed.toString('utf8');
  // Match text in PDF strings e.g. (text) Tj or [(text)] TJ
  const matches = textStr.match(/\((.*?)\)/g) || [];
  matches.forEach(t => {
    const clean = t.slice(1, -1);
    if (clean.length > 0 && !clean.includes('PDF') && !clean.includes('Font')) {
      textOut.push(clean);
    }
  });
}

console.log('=== PDF TEXT EXTRACTED ===');
console.log(textOut.join('\n'));
