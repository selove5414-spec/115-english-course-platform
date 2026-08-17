const fs = require('fs');
const path = require('path');
const syncHandler = require('./api/sync');

module.exports = async (req, res) => {
  let reqUrl = req.url ? req.url.split('?')[0] : '/index.html';

  // API 路由分派
  if (reqUrl.startsWith('/api/sync') || reqUrl.startsWith('/api/notion')) {
    return syncHandler(req, res);
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  const filePath = path.join(__dirname, 'public', reqUrl);

  const targetFile = (fs.existsSync(filePath) && fs.statSync(filePath).isFile())
    ? filePath
    : path.join(__dirname, 'public', 'index.html');

  const ext = path.extname(targetFile).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown; charset=utf-8'
  };

  const contentType = mimeTypes[ext] || 'text/plain';

  try {
    const content = fs.readFileSync(targetFile);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.statusCode = 200;
    res.end(content);
  } catch (err) {
    res.statusCode = 500;
    res.end('Server Error: ' + err.message);
  }
};
