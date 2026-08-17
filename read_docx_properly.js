const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readZipFile(zipBuf) {
  const files = {};
  let eocdPos = zipBuf.length - 22;
  while (eocdPos >= 0) {
    if (zipBuf.readUInt32LE(eocdPos) === 0x06054b50) break;
    eocdPos--;
  }
  if (eocdPos < 0) return files;
  
  const cdOffset = zipBuf.readUInt32LE(eocdPos + 16);
  const cdEntries = zipBuf.readUInt16LE(eocdPos + 10);
  
  let pos = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (zipBuf.readUInt32LE(pos) !== 0x02014b50) break;
    const compression = zipBuf.readUInt16LE(pos + 10);
    const compressedSize = zipBuf.readUInt32LE(pos + 20);
    const nameLen = zipBuf.readUInt16LE(pos + 28);
    const extraLen = zipBuf.readUInt16LE(pos + 30);
    const commentLen = zipBuf.readUInt16LE(pos + 32);
    const localHeaderOffset = zipBuf.readUInt32LE(pos + 42);
    
    const filename = zipBuf.toString('utf8', pos + 46, pos + 46 + nameLen);
    
    // Read local header
    const localNameLen = zipBuf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = zipBuf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    
    const compressedData = zipBuf.slice(dataStart, dataStart + compressedSize);
    let data;
    if (compression === 0) data = compressedData;
    else if (compression === 8) data = zlib.inflateRawSync(compressedData);
    
    files[filename] = data;
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function parseDocx(filePath) {
  const buf = fs.readFileSync(filePath);
  const zipFiles = readZipFile(buf);
  const docXml = zipFiles['word/document.xml'];
  if (!docXml) return 'No document.xml';
  const xml = docXml.toString('utf8');
  return xml.replace(/<w:p[^>]*>/g, '\n')
            .replace(/<w:tr[^>]*>/g, '\n')
            .replace(/<w:tc[^>]*>/g, '\t')
            .replace(/<[^>]+>/g, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();
}

function parsePdfStreams(filePath) {
  const buf = fs.readFileSync(filePath);
  const zipFiles = readZipFile(buf); // not a zip, but let's check pdf streams
  const str = buf.toString('latin1');
  const textMatches = str.match(/\/Title|\/Subject|\/Keywords|TJ|Tj|ET/g);
  
  // Simple PDF text extractor
  const text = [];
  const regex = /\((.*?)\)/g;
  let m;
  while ((m = regex.exec(str)) !== null) {
    if (m[1].length > 1 && !m[1].includes('Font') && !m[1].includes('Identity')) {
      text.push(m[1]);
    }
  }
  return text.join(' ');
}

const dir = path.join(__dirname, '課程及科務安排');
console.log('=== 115學年度書卷雜誌訂購 .docx ===');
console.log(parseDocx(path.join(dir, '115學年度書卷雜誌訂購 .docx')));

console.log('\n=== 高中部教學MEMO.docx ===');
console.log(parseDocx(path.join(dir, '高中部教學MEMO.docx')));
