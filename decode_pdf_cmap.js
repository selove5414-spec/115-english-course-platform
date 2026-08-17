const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filePath = path.join(__dirname, '課程及科務安排', '115(1)行事曆_0724.pdf');
const buf = fs.readFileSync(filePath);
const str = buf.toString('latin1');

// Find all CMap streams in PDF
const cmap = {};
const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let m;

while ((m = streamRegex.exec(str)) !== null) {
  const rawBuf = Buffer.from(m[1], 'latin1');
  let text = '';
  try { text = zlib.inflateSync(rawBuf).toString('utf8'); } catch(e) {}
  
  if (text.includes('beginbfchar')) {
    const lines = text.split('\n');
    lines.forEach(l => {
      const match = l.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (match) {
        const src = match[1];
        const dstCode = parseInt(match[2], 16);
        cmap[src.toUpperCase()] = String.fromCharCode(dstCode);
      }
    });
  }
  
  if (text.includes('beginbfrange')) {
    const lines = text.split('\n');
    lines.forEach(l => {
      const match = l.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (match) {
        const start = parseInt(match[1], 16);
        const end = parseInt(match[2], 16);
        let dst = parseInt(match[3], 16);
        for (let code = start; code <= end; code++) {
          const key = code.toString(16).padStart(match[1].length, '0').toUpperCase();
          cmap[key] = String.fromCharCode(dst++);
        }
      }
    });
  }
}

console.log('CMap entries decoded:', Object.keys(cmap).length);

// Now decode hex text streams
streamRegex.lastIndex = 0;
while ((m = streamRegex.exec(str)) !== null) {
  const rawBuf = Buffer.from(m[1], 'latin1');
  let text = '';
  try { text = zlib.inflateSync(rawBuf).toString('utf8'); } catch(e) {}
  
  if (text.includes('TJ') || text.includes('Tj')) {
    const hexBlocks = text.match(/<([0-9a-fA-F]+)>/g) || [];
    let line = '';
    hexBlocks.forEach(hb => {
      const hex = hb.slice(1, -1).toUpperCase();
      // Chunk by 4 chars or 2 chars
      for (let i = 0; i < hex.length; i += 4) {
        const charCode = hex.substr(i, 4);
        if (cmap[charCode]) {
          line += cmap[charCode];
        } else {
          const charCode2 = hex.substr(i, 2);
          if (cmap[charCode2]) line += cmap[charCode2];
        }
      }
    });
    if (line.trim().length > 0) {
      console.log('Decoded Text:', line);
    }
  }
}
