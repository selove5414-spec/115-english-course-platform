/**
 * 自動在 Notion【高中部教學工作】主頁面建立 4 大科務資料庫並寫入初始資料
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const fullPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        content.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
          if (match && !match[1].startsWith('#')) {
            const key = match[1];
            let value = match[2] || '';
            value = value.trim().replace(/^['"](.*)['"]$/, '$1');
            if (value) process.env[key] = value;
          }
        });
      } catch (e) {}
    }
  }
}

loadEnv();

const pageId = process.env.NOTION_PAGE_ID || '3bf6485c-74ff-8026-8fd7-e6f222de5d5a';
const token = process.env.NOTION_API_KEY || '';

function apiRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const req = https.request({
      hostname: 'api.notion.com',
      path,
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  if (!token) {
    console.error('請先在 .env.local 設定 NOTION_API_KEY');
    return;
  }
  console.log('🚀 開始在 Notion【高中部教學工作】頁面檢查與建立資料庫...');
}

main().catch(console.error);
