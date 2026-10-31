/**
 * Spotify Redirect for Quantumult X
 */
let body = $response.body;
let url = $request.url;

if (body) {
    let appScheme = "spotify://";

    // 1. 提取 Scheme
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
    let titleMatch = body.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) || body.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/ \| Spotify$/i, '') : "Spotify 音乐";

    let descMatch = body.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    let desc = descMatch ? descMatch[1] : "轻点顶部通知切入 App 收听";

    let imageMatch = body.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    let image = imageMatch ? imageMatch[1] : "";

    // 3. Quantumult X 规范通知接口
    if (typeof $notify !== "undefined") {
        $notify(
            "正在打开 Spotify",
            title,
            "微信已拦截跳转，请轻点此通知直接打开",
            { "open-url": appScheme }
        );
    }

    // 4. 原生暗黑风格卡片
    let mobilePage = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>${title}</title>
    <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body {
            margin: 0; padding: 0; width: 100%; height: 100%;
            background-color: #121212; color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;
        }
        .container { width: 86%; max-width: 360px; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .cover-wrapper { width: 240px; height: 240px; margin-bottom: 24px; box-shadow: 0 12px 36px rgba(0,0,0,0.7); border-radius: 8px; overflow: hidden; background-color: #282828; }
        .cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .track-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #fff; line-height: 1.3; max-width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .track-desc { font-size: 14px; color: #b3b3b3; margin-bottom: 32px; line-height: 1.4; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .btn-open { background-color: #1DB954; color: #000; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 500px; text-decoration: none; display: inline-block; }
        .tip { margin-top: 18px; font-size: 12px; color: #6a6a6a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="cover-wrapper"><img class="cover-img" src="${image}" alt="Cover" /></div>
        <div class="track-title">${title}</div>
        <div class="track-desc">${desc}</div>
        <a class="btn-open" href="${appScheme}">在 Spotify 中打开</a>
        <div class="tip">轻点屏幕顶部横幅通知亦可直接跳转</div>
    </div>
</body>
</html>`;

    $done({ body: mobilePage });
} else {
    $done({});
}