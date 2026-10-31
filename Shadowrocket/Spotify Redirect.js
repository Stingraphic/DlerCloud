/**
 * Spotify Redirect for WeChat
 */
let body = $response.body;
let url = $request.url;

if (body && /<html/i.test(body)) {
    let match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    
    if (match) {
        // 1. 发送 iOS 系统通知，轻点直接由 Safari / Spotify App 接管
        $notification.post("点击此处打开 Spotify", "", "轻点本通知在系统默认浏览器中打开", { "open-url": url });

        // 2. 顶部微型提示横幅
        let banner = `
        <div style="position:fixed;top:0;left:0;width:100%;z-index:999999;background:#1DB954;padding:12px 16px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.3);text-align:center;">
            <div style="color:#fff;font-size:13px;font-weight:bold;">已推送跳转通知</div>
            <div style="color:#e0e0e0;font-size:11px;margin-top:2px;">轻点屏幕顶部通知，或点击右上角「…」在浏览器中打开</div>
        </div>
        <div style="height:48px;"></div>
        `;

        body = body.replace(/(<body[^>]*>)/i, `$1${banner}`);
        $done({ body: body });
    } else {
        $done({});
    }
} else {
    $done({});
}