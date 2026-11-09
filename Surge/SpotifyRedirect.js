/**
 * Spotify Redirect for Surge（微信专属 - 高清居中卡片 & 系统跳转通知）
 *
 * Surge 修正版，改了三处：
 * 1. $done 改用 http-response 要求的平铺格式 { headers, body }，不再嵌套 response（那是 QX/Loon 写法，Surge 会当作不修改）。
 * 2. 补上 $notification.post：点按横幅通知以 spotify:// 直达 App，并带封面图（模块里需配合 max-size=-1）。
 * 3. 返回时剔除原页面的 CSP 响应头，否则替换后的卡片页内联样式和脚本会被 Spotify 原页面的安全策略拦截。
 */

let reqHeaders = $request.headers || {};
let ua = reqHeaders['User-Agent'] || reqHeaders['user-agent'] || '';
let isWeChat = /micromessenger/i.test(ua);

let body = $response.body;
let url = $request.url;

if (isWeChat && body) {
  let appScheme = "spotify://";

  // 1. 提取 Scheme：先从 URL 取，其次从页面正文里找
  let match = url.match(/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
  if (match) {
    appScheme = `spotify://${match[1]}/${match[2]}`;
  } else {
    let schemeMatch = body.match(/spotify:\/\/(track|album|artist|playlist|show|episode)\/[a-zA-Z0-9]+/i);
    if (schemeMatch) {
      appScheme = schemeMatch[0];
    }
  }

  // 2. 提取 OpenGraph 元数据
  function og(prop) {
    let m = body.match(new RegExp('<meta[^>]+property=["\']og:' + prop + '["\'][^>]*content=["\']([^"\']+)["\']', 'i'))
      || body.match(new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]*property=["\']og:' + prop + '["\']', 'i'));
    return m ? m[1] : '';
  }

  let titleMatch = body.match(/<title>(.*?)<\/title>/i);
  let title = og('title') || (titleMatch ? titleMatch[1].replace(/ \| Spotify$/i, '') : "Spotify 音乐");
  let desc = og('description') || "在 Spotify 中打开";
  let image = og('image');

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 3. 发送系统横幅通知：点按通知以 spotify:// 直达 App
  let notifyOpts = { url: appScheme };
  if (image) {
    notifyOpts['media-url'] = image;
  }
  $notification.post(title, "Spotify", "点按此通知在 Spotify App 中打开", notifyOpts);

  // 4. 生成暗黑居中卡片页
  let mobilePage = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(title)} | Spotify</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #121212; color: #fff; font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { width: 100%; max-width: 340px; background: #181818; border-radius: 16px; padding: 28px 24px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.55); }
  .cover { width: 200px; height: 200px; border-radius: 10px; object-fit: cover; background: #282828; box-shadow: 0 8px 24px rgba(0,0,0,.5); }
  .no-cover { width: 200px; height: 200px; border-radius: 10px; background: #282828; display: inline-flex; align-items: center; justify-content: center; font-size: 56px; color: #1db954; }
  h1 { font-size: 20px; line-height: 1.35; margin: 20px 0 8px; word-break: break-word; }
  p { font-size: 14px; line-height: 1.55; color: #b3b3b3; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .btn { display: block; margin-top: 24px; padding: 14px 20px; background: #1db954; color: #000; font-size: 16px; font-weight: 700; border-radius: 999px; text-decoration: none; }
  .btn:active { background: #1ed760; }
  .tip { margin-top: 14px; font-size: 12px; color: #727272; }
</style>
</head>
<body>
  <div class="card">
    ${image ? `<img class="cover" src="${esc(image)}" alt="">` : `<div class="no-cover">♪</div>`}
    <h1>${esc(title)}</h1>
    <p>${esc(desc)}</p>
    <a class="btn" href="${appScheme}">在 Spotify App 中打开</a>
    <div class="tip">点不开时，下拉点按刚收到的系统通知也可以直达</div>
  </div>
</body>
</html>`;

  // 5. 平铺格式返回：替换 body，并剔除会拦截内联样式/脚本的 CSP 与旧的 Content-Length
  let respHeaders = {};
  let origHeaders = $response.headers || {};
  Object.keys(origHeaders).forEach(function (k) {
    let lk = k.toLowerCase();
    if (lk === 'content-security-policy' || lk === 'content-security-policy-report-only' || lk === 'content-length') {
      return;
    }
    respHeaders[k] = origHeaders[k];
  });
  respHeaders['Content-Type'] = 'text/html; charset=utf-8';

  $done({ headers: respHeaders, body: mobilePage });
} else {
  $done({});
}
