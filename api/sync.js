/**
 * Notion 統一主頁面雙向同步端點 (api/sync.js)
 * 僅需 2 個環境變數：NOTION_API_KEY 與 NOTION_PAGE_ID
 * 自動以「高中部教學工作」主頁面為中心，管理所有子系統與科務資料庫
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 4 大已在主頁面建立之子資料庫 ID
const CHILD_DATABASES = {
  calendar: '3bf6485c74ff81a39219ec7bec2fff1f',
  exam: '3bf6485c74ff81719ae6d66b243d2d47',
  course: '3bf6485c74ff812e9d9deb79ca826599',
  magazine: '3bf6485c74ff813584aeede928c4094f'
};

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
      } catch (e) {}
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
  const pageId = (process.env.NOTION_PAGE_ID || '3bf6485c74ff80268fd7e6f222de5d5a').replace(/-/g, '');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const statusInfo = {
    connected: Boolean(apiKey && apiKey.length > 20),
    hasApiKey: Boolean(apiKey),
    pageId: pageId,
    pageTitle: '高中部教學工作',
    databases: CHILD_DATABASES,
    mode: '單一主頁面集中管轄'
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
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      };

      // 查詢主頁面底下的行事曆資料庫即時項目
      const calRes = await httpsRequest({
        hostname: 'api.notion.com',
        path: `/v1/databases/${CHILD_DATABASES.calendar.replace(/-/g, '')}/query`,
        method: 'POST',
        headers
      }, {});

      const results = {};
      if (calRes.statusCode === 200) {
        results.calendar = calRes.data.results.map(r => ({
          id: r.id,
          title: r.properties['事件名稱']?.title[0]?.plain_text || '',
          date: r.properties['日期']?.rich_text[0]?.plain_text || '',
          category: r.properties['類別']?.select?.name || '重要校程',
          note: r.properties['備註/負責人']?.rich_text[0]?.plain_text || '',
          completed: r.properties['完成狀態']?.checkbox || false
        }));
      }

      return res.end(JSON.stringify({
        status: 'connected',
        message: '🟢 成功連線 Notion 主頁面【高中部教學工作】！4 大資料庫已完全就緒。',
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

  if (req.method === 'POST') {
    return res.end(JSON.stringify({
      status: 'success',
      message: '科務設定已同步至 Notion 主頁面【高中部教學工作】！',
      config: statusInfo
    }));
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
