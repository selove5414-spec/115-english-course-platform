const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filePath = path.join(__dirname, '課程及科務安排', '115(1)行事曆_0724.pdf');
const buf = fs.readFileSync(filePath);
const str = buf.toString('latin1');

// Extract all stream contents
const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let m;
let streamIdx = 0;

while ((m = streamRegex.exec(str)) !== null) {
  const rawBuf = Buffer.from(m[1], 'latin1');
  let text = '';
  try {
    text = zlib.inflateSync(rawBuf).toString('utf8');
  } catch (e) {
    try {
      text = zlib.inflateRawSync(rawBuf).toString('utf8');
    } catch (e2) {
      text = rawBuf.toString('utf8');
    }
  }

  // Look for text operators like (string) Tj or <hex> TJ
  const hexMatches = text.match(/<([0-9a-fA-F]+)>\s*TJ|<([0-9a-fA-F]+)>\s*Tj/g) || [];
  const strMatches = text.match(/\((.*?)\)\s*Tj|\((.*?)\)\s*TJ/g) || [];

  if (hexMatches.length > 0 || strMatches.length > 0) {
    console.log(`--- Stream ${streamIdx} ---`);
    if (hexMatches.length > 0) console.log('Hex matches:', hexMatches.slice(0, 30));
    if (strMatches.length > 0) console.log('Str matches:', strMatches.slice(0, 30));
  }
  streamIdx++;
}
