/**
 * Spotify Redirect for Shadowrocket
 */
let body = $response.body;
let url = $request.url;

if (body) {
    let appScheme = "spotify://";

    // 提取 Spotify 核心路径 (album/track/playlist 等)
    let match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    if (match) {
        appScheme = `spotify://${match[1]}/${match[2]}`;
    } else {
        let schemeMatch = body.match(/spotify:\/\/(track|album|artist|playlist|show|episode)\/[a-zA-Z0-9]+/i);
        if (schemeMatch) {
            appScheme = schemeMatch[0];
        }
    }

    // Shadowrocket 标准跳转通知：第 4 个参数直接传入 scheme 字符串
    $notification.post("正在打开 Spotify", "轻点直接切入 App 播放", "微信已拦截跳转，请轻点此横幅", appScheme);

    // 彻底干掉自带的白底引导页，只保留轻量纯黑背景
    let cleanHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Spotify</title><style>body{margin:0;background:#121212;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:-apple-system,sans-serif;text-align:center;padding:20px;box-sizing:border-box;}</style></head><body><div><div style="font-size:18px;font-weight:bold;margin-bottom:8px;">正在打开 Spotify</div><div style="color:#b3b3b3;font-size:13px;">请轻点屏幕顶部落下的横幅通知</div></div></body></html>`;

    $done({ body: cleanHtml });
} else {
    $done({});
}