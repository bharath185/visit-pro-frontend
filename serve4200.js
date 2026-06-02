const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname + '/dist/visitor-app';
const port = 4200;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff' };

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  let fp = path.join(dir, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(dir, 'index.html');
  fs.readFile(fp, (err, d) => {
    if (err) { res.writeHead(500); return res.end('Error'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(port, () => console.log('Frontend on http://0.0.0.0:' + port));
