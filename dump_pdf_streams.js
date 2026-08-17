const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filePath = path.join(__dirname, '課程及科務安排', '115(1)行事曆_0724.pdf');
const buf = fs.readFileSync(filePath);

// Find all stream objects
let pos = 0;
let index = 0;
while ((pos = buf.indexOf('stream', pos)) !== -1) {
  let endPos = buf.indexOf('endstream', pos);
  if (endPos === -1) break;
  
  let streamData = buf.slice(pos + 6, endPos);
  // Strip leading \r\n
  if (streamData[0] === 0x0d && streamData[1] === 0x0a) streamData = streamData.slice(2);
  else if (streamData[0] === 0x0a) streamData = streamData.slice(1);
  
  try {
    const decomp = zlib.inflateSync(streamData);
    const txt = decomp.toString('utf8');
    if (txt.includes('月') || txt.includes('段考') || txt.includes('開學') || txt.includes('115')) {
      console.log(`=== STREAM ${index} ===`);
      console.log(txt.slice(0, 1000));
    }
  } catch (e) {
    // raw stream or different compression
  }
  index++;
  pos = endPos + 9;
}
