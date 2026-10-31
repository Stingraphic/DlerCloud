/**
 * Spotify Redirect for Shadowrocket
 */
let body = $response.body;
let url = $request.url;

if (body) {
    let appScheme = "spotify://";

    // 1. 匹配 Spotify 各种链接（带参数、带 query 均能匹配）
    let match = url.match(/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    if (match) {
        appScheme = `spotify://${match[1]}/${match[2]}`;
    } else {
        let schemeMatch = body.match(/spotify:\/\/(track|album|artist|playlist|show|episode)\/[a-zA-Z0-9]+/i);
        if (schemeMatch) {
            appScheme = schemeMatch[0];
        }
    }

    // 2. 发送直跳通知：第 4 参数直接传 Scheme
    $notification.post("正在打开 Spotify", "轻点直接切入 App", "微信已拦截，轻点横幅跳转", appScheme);

    // 3. 覆盖全黑页面，去掉官方所有引导页
    let cleanHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Spotify</title><style>body{margin:0;background:#121212;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:-apple-system,sans-serif;text-align:center;padding:20px;box-sizing:border-box;}</style></head><body><div><div style="font-size:18px;font-weight:bold;margin-bottom:8px;">正在打开 Spotify</div><div style="color:#b3b3b3;font-size:13px;">请轻点屏幕顶部通知横幅</div></div></body></html>`;

    $done({ body: cleanHtml });
} else {
    $done({});
}