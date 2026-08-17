const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readZipEntry(zipBuffer, entryName) {
  let offset = 0;
  while (offset < zipBuffer.length - 30) {
    const signature = zipBuffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) break;
    
    const compression = zipBuffer.readUInt16LE(offset + 8);
    const compressedSize = zipBuffer.readUInt32LE(offset + 18);
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 22);
    const nameLen = zipBuffer.readUInt16LE(offset + 26);
    const extraLen = zipBuffer.readUInt16LE(offset + 28);
    
    const filename = zipBuffer.toString('utf8', offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    
    if (filename === entryName) {
      const compressedData = zipBuffer.slice(dataStart, dataStart + compressedSize);
      if (compression === 0) return compressedData;
      if (compression === 8) return zlib.inflateRawSync(compressedData);
    }
    offset = dataStart + compressedSize;
  }
  return null;
}

function parseDocx(filePath) {
  const buf = fs.readFileSync(filePath);
  const xmlBuf = readZipEntry(buf, 'word/document.xml');
  if (!xmlBuf) return '';
  const xml = xmlBuf.toString('utf8');
  return xml.replace(/<w:p[^>]*>/g, '\n')
            .replace(/<w:tr[^>]*>/g, '\n')
            .replace(/<w:tc[^>]*>/g, '\t')
            .replace(/<[^>]+>/g, '')
            .trim();
}

function parsePdfRaw(filePath) {
  const buf = fs.readFileSync(filePath);
  const str = buf.toString('latin1');
  
  // Find all stream blocks in PDF
  const streams = str.match(/stream\r?\n([\s\S]*?)\r?\nendstream/g) || [];
  const textPieces = [];
  
  streams.forEach(s => {
    const rawData = s.replace(/^stream\r?\n/, '').replace(/\r?\nendstream$/, '');
    try {
      const unzipped = zlib.inflateSync(Buffer.from(rawData, 'latin1')).toString('utf8');
      // match text in () TJ or () Tj
      const matches = unzipped.match(/\((.*?)\)\s*TJ|\((.*?)\)\s*Tj/g) || [];
      matches.forEach(m => {
        const t = m.replace(/^\(/, '').replace(/\)\s*TJ$|\)\s*Tj$/, '');
        if (t) textPieces.push(t);
      });
    } catch(e) {
      // not zipped stream
    }
  });
  
  return textPieces.join('\n');
}

const dir = path.join(__dirname, '課程及科務安排');

console.log('==================== DOCX: 115學年度書卷雜誌訂購 .docx ====================');
console.log(parseDocx(path.join(dir, '115學年度書卷雜誌訂購 .docx')));

console.log('\n==================== DOCX: 高中部教學MEMO.docx ====================');
console.log(parseDocx(path.join(dir, '高中部教學MEMO.docx')));

console.log('\n==================== PDF: 115(1)行事曆_0724.pdf ====================');
console.log(parsePdfRaw(path.join(dir, '115(1)行事曆_0724.pdf')));
