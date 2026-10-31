/**
 * Spotify Redirect for WeChat
 * 逻辑：发送系统跳转通知 + 微信内页面右上角指引
 */
let body = $response.body;
let url = $request.url;

if (body && /<html/i.test(body)) {
    let match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    
    if (match) {
        // 1. 发送 iOS 系统通知，附带 open-url 参数（点击系统横幅直接由 Safari / Spotify 接管）
        $notification.post("点击此处在默认浏览器中打开 Spotify", "", "微信已拦截应用跳转，轻点本条通知直达", { "open-url": url });

        // 2. 在微信页面顶部注入醒目提示
        let banner = `
        <div style="position:fixed;top:0;left:0;width:100%;z-index:999999;background:#1DB954;padding:14px 16px;box-sizing:border-box;font-family:-apple-system,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.4);display:flex;flex-direction:column;align-items:center;">
            <div style="color:#fff;font-size:14px;font-weight:bold;margin-bottom:4px;">已触发系统跳转</div>
            <div style="color:#f0f0f0;font-size:12px;">轻点屏幕顶部通知，或点右上角「…」选择在浏览器中打开</div>
        </div>
        `;

        body = body.replace(/(<body[^>]*>)/i, `$1${banner}`);
        $done({ body: body });
    } else {
        $done({});
    }
} else {
    $done({});
}