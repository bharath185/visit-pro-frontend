const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname + '/dist/visitor-app';
const port = 5010;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff' };

const NONCE = require('crypto').randomBytes(16).toString('base64');

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  let fp = path.join(dir, url === '/' ? 'index.html' : url);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(dir, 'index.html');

  // Security Headers
  const headers = {
    'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream',

    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enable XSS filter in older browsers (legacy)
    'X-XSS-Protection': '1; mode=block',

    // HTTP Strict Transport Security (only effective over HTTPS, but set for future-proofing)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (restrict browser features)
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',

    // Content Security Policy
    'Content-Security-Policy':
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.amap.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' http://192.168.2.22:8081 http://192.168.2.45:8081 http://localhost:8081 http://127.0.0.1:8081; " +
      "frame-ancestors 'none'; " +
      "form-action 'self'; " +
      "base-uri 'self'"
  };

  // Prevent caching of dynamic pages (HTML)
  if (path.extname(fp) === '.html') {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    headers['Surrogate-Control'] = 'no-store';
  }

  fs.readFile(fp, (err, d) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Internal Server Error');
    }
    res.writeHead(200, headers);
    res.end(d);
  });
}).listen(port, () => console.log('Frontend on http://localhost:' + port));
