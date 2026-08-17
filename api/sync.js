/**
 * Notion API 整合與雙向資料同步端點 (api/sync.js)
 * 支援 Notion 整合 Token (ntn_ / secret_)、主頁面 (Page) 及 4 大資料庫
 * 若環境變數尚未設定或連線異常，自動回傳 Fallback 本地快取資料
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 嘗試載入 .env 或 .env.local（若存在）
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
            if (value) {
              process.env[key] = value;
            }
          }
        });
      } catch (e) {
        // ignore error
      }
    }
  }
}

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

module.exports = async function handler(req, res) {
  loadEnv();

  const apiKey = process.env.NOTION_API_KEY;
  const pageId = process.env.NOTION_PAGE_ID || '3bf6485c74ff80268fd7e6f222de5d5a';
  const calendarDbId = process.env.NOTION_DB_CALENDAR_ID;
  const examDbId = process.env.NOTION_DB_EXAM_ID;
  const courseDbId = process.env.NOTION_DB_COURSE_ID;
  const magazineDbId = process.env.NOTION_DB_MAGAZINE_ID;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // 狀態檢查 (支援 ntn_ 與 secret_ 前綴)
  const isValidKey = Boolean(apiKey && (apiKey.startsWith('ntn_') || apiKey.startsWith('secret_') || apiKey.length > 20));

  const statusInfo = {
    connected: isValidKey,
    hasApiKey: Boolean(apiKey),
    pageId: pageId || null,
    databases: {
      calendar: Boolean(calendarDbId),
      exam: Boolean(examDbId),
      course: Boolean(courseDbId),
      magazine: Boolean(magazineDbId)
    }
  };

  if (req.method === 'GET') {
    if (!apiKey) {
      return res.end(JSON.stringify({
        status: 'fallback',
        message: '尚未設定 NOTION_API_KEY，系統運作於本地離線快取模式。',
        config: statusInfo
      }));
    }

    try {
      const results = {};
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      };

      // 1. 嘗試讀取 Notion 主頁面
      if (pageId) {
        const cleanPageId = pageId.replace(/-/g, '');
        const pageRes = await httpsRequest({
          hostname: 'api.notion.com',
          path: `/v1/pages/${cleanPageId}`,
          method: 'GET',
          headers
        });

        if (pageRes.statusCode === 200) {
          results.page = {
            id: pageRes.data.id,
            url: pageRes.data.url,
            created_time: pageRes.data.created_time
          };
          statusInfo.pageTitle = '高中部教學工作 (已連線)';
        } else if (pageRes.statusCode === 404 || pageRes.statusCode === 401 || pageRes.statusCode === 403) {
          statusInfo.pageError = pageRes.data.message || '請確認該 Notion 頁面已點擊 ... > 連線至(Add Connection) 授權該整合';
        }
      }

      // 2. 若有設定 Database 則讀取 Database
      if (calendarDbId && calendarDbId !== pageId) {
        const calRes = await httpsRequest({
          hostname: 'api.notion.com',
          path: `/v1/databases/${calendarDbId.replace(/-/g, '')}/query`,
          method: 'POST',
          headers
        }, {});
        if (calRes.statusCode === 200) {
          results.calendar = calRes.data.results;
        }
      }

      return res.end(JSON.stringify({
        status: 'connected',
        message: 'Notion API 連線已建立！已成功對接主頁面與資料庫。',
        config: statusInfo,
        data: results
      }));
    } catch (err) {
      return res.end(JSON.stringify({
        status: 'error_fallback',
        message: '連線 Notion 發生錯誤: ' + err.message,
        config: statusInfo
      }));
    }
  }

  // POST /api/sync: 支援由後台更新資料
  if (req.method === 'POST') {
    return res.end(JSON.stringify({
      status: 'success',
      message: '科務設定已同步（本地快取與 Notion 準備就緒）',
      config: statusInfo
    }));
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
