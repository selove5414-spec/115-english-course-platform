const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Unzip helper for docx / xlsx
function readZipEntry(zipBuffer, entryName) {
  // Simple ZIP parser in JS
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
      if (compression === 0) {
        return compressedData;
      } else if (compression === 8) {
        return zlib.inflateRawSync(compressedData);
      }
    }
    offset = dataStart + compressedSize;
  }
  return null;
}

function parseDocx(filePath) {
  const buf = fs.readFileSync(filePath);
  const xmlBuf = readZipEntry(buf, 'word/document.xml');
  if (!xmlBuf) return 'Could not find word/document.xml';
  const xml = xmlBuf.toString('utf8');
  // Strip XML tags
  return xml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '').replace(/\n+/g, '\n').trim();
}

function parseXlsx(filePath) {
  const buf = fs.readFileSync(filePath);
  
  // Shared strings
  const ssBuf = readZipEntry(buf, 'xl/sharedStrings.xml');
  const sharedStrings = [];
  if (ssBuf) {
    const ssXml = ssBuf.toString('utf8');
    const matches = ssXml.match(/<t[^>]*>(.*?)<\/t>/g) || [];
    matches.forEach(m => {
      sharedStrings.push(m.replace(/<[^>]+>/g, ''));
    });
  }
  
  // Sheet 1
  const sheetBuf = readZipEntry(buf, 'xl/worksheets/sheet1.xml');
  if (!sheetBuf) return 'Sheet 1 not found';
  const sheetXml = sheetBuf.toString('utf8');
  
  // Extract rows
  const rowMatches = sheetXml.match(/<row[^>]*>(.*?)<\/row>/g) || [];
  const rows = [];
  rowMatches.forEach(r => {
    const cellMatches = r.match(/<c[^>]*>(.*?)<\/c>/g) || [];
    const rowVal = [];
    cellMatches.forEach(c => {
      const isShared = c.includes('t="s"');
      const valMatch = c.match(/<v>(.*?)<\/v>/);
      if (valMatch) {
        let val = valMatch[1];
        if (isShared) {
          val = sharedStrings[parseInt(val, 10)] || val;
        }
        rowVal.push(val);
      }
    });
    if (rowVal.length > 0) rows.push(rowVal.join(' | '));
  });
  return rows.join('\n');
}

function parsePdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const text = buf.toString('latin1');
  const matches = text.match(/\((.*?)\)\s*TJ|\((.*?)\)\s*Tj/g) || [];
  const extracted = [];
  matches.forEach(m => {
    const clean = m.replace(/^\(/, '').replace(/\)\s*TJ$|\)\s*Tj$/, '');
    if (clean) extracted.push(clean);
  });
  return extracted.join(' ');
}

const dir = path.join(__dirname, '課程及科務安排');
console.log('=== docx: 115學年度書卷雜誌訂購 .docx ===');
console.log(parseDocx(path.join(dir, '115學年度書卷雜誌訂購 .docx')));

console.log('\n=== docx: 高中部教學MEMO.docx ===');
console.log(parseDocx(path.join(dir, '高中部教學MEMO.docx')));

console.log('\n=== xlsx: 115學年度第1學期_英文科教師授課節數統計表_v4.xlsx ===');
console.log(parseXlsx(path.join(dir, '115學年度第1學期_英文科教師授課節數統計表_v4.xlsx')));

console.log('\n=== xlsx: 英二A.xlsx ===');
console.log(parseXlsx(path.join(dir, '英二A.xlsx')));

console.log('\n=== pdf: 115(1)行事曆_0724.pdf ===');
console.log(parsePdfText(path.join(dir, '115(1)行事曆_0724.pdf')));
