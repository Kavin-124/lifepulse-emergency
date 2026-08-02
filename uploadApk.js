const https = require('https');
const fs = require('fs');
const path = require('path');

const apkPath = path.join(__dirname, 'public', 'lifepulse-mobile.apk');
if (!fs.existsSync(apkPath)) {
  console.error('APK file not found at:', apkPath);
  process.exit(1);
}

const stats = fs.statSync(apkPath);
console.log('Uploading APK file size:', stats.size, 'bytes');

const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

const header = `--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n` +
  `--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="lifepulse-mobile.apk"\r\nContent-Type: application/vnd.android.package-archive\r\n\r\n`;

const footer = `\r\n--${boundary}--\r\n`;

const req = https.request({
  hostname: 'catbox.moe',
  path: '/user/api.php',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(header) + stats.size + Buffer.byteLength(footer)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('=== DIRECT APK DOWNLOAD URL ===');
    console.log(data.trim());
    console.log('===============================');
  });
});

req.on('error', err => console.error('Upload Error:', err));

req.write(header);
const fileStream = fs.createReadStream(apkPath);
fileStream.on('data', chunk => req.write(chunk));
fileStream.on('end', () => {
  req.write(footer);
  req.end();
});
