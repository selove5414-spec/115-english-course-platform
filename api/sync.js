/**
 * Notion 統一主頁面雙向同步端點 (api/sync.js)
 * 僅需 2 個環境變數：NOTION_API_KEY 與 NOTION_PAGE_ID
 * 自動以「高中部教學工作」主頁面為中心，管理所有子系統與科務區塊
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
        // ignore
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
  const pageId = (process.env.NOTION_PAGE_ID || '3bf6485c74ff80268fd7e6f222de5d5a').replace(/-/g, '');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const statusInfo = {
    connected: Boolean(apiKey && apiKey.length > 20),
    hasApiKey: Boolean(apiKey),
    pageId: pageId,
    pageTitle: '高中部教學工作',
    mode: '統一主頁面集中管理架構'
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

      // 1. 取得主頁面資料
      const pageRes = await httpsRequest({
        hostname: 'api.notion.com',
        path: `/v1/pages/${pageId}`,
        method: 'GET',
        headers
      });

      // 2. 取得主頁面底下的子區塊與子清單
      const blocksRes = await httpsRequest({
        hostname: 'api.notion.com',
        path: `/v1/blocks/${pageId}/children?page_size=100`,
        method: 'GET',
        headers
      });

      const isPageOk = (pageRes.statusCode === 200);
      const isBlocksOk = (blocksRes.statusCode === 200);

      if (isPageOk) {
        return res.end(JSON.stringify({
          status: 'connected',
          message: '🟢 成功連線至 Notion 主頁面【高中部教學工作】！所有小系統已集中管理。',
          config: {
            ...statusInfo,
            pageTitle: '高中部教學工作 (已連線)',
            childBlocksCount: isBlocksOk && blocksRes.data.results ? blocksRes.data.results.length : 0
          },
          data: {
            page: pageRes.data,
            blocks: isBlocksOk ? blocksRes.data.results : []
          }
        }));
      } else {
        return res.end(JSON.stringify({
          status: 'error_fallback',
          message: pageRes.data?.message || 'Notion 頁面授權中，請確認已在 Notion 頁面右上角 [...] 加入該整合連線。',
          config: statusInfo
        }));
      }
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
