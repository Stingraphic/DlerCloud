/**
 * Spotify Redirect for WeChat (Supports open.spotify.com & spotify.app.link)
 */
let body = $response.body;
let url = $request.url;

if (body && /<html/i.test(body)) {
    let appScheme = "spotify://";
    
    // 1. 尝试从 URL 中解析标准路径
    let match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    if (match) {
        appScheme = `spotify://${match[1]}/${match[2]}`;
    } else {
        // 2. 如果是 spotify.app.link，从页面源码中提取真实的 spotify:// scheme 目标
        let schemeMatch = body.match(/spotify:\/\/(track|album|artist|playlist|show|episode)\/[a-zA-Z0-9]+/i);
        if (schemeMatch) {
            appScheme = schemeMatch[0];
        }
    }

    // 3. 构建弹窗覆盖层
    let modalHtml = `
    <div id="wx-spotify-mask" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:99999999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;-webkit-tap-highlight-color:transparent;">
        <div style="background:#282828;width:82%;max-width:320px;border-radius:16px;padding:24px 20px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
            <div style="width:48px;height:48px;background:#1DB954;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            </div>
            <div style="color:#fff;font-size:17px;font-weight:bold;margin-bottom:8px;">前往 Spotify</div>
            <div style="color:#b3b3b3;font-size:13px;line-height:1.5;margin-bottom:20px;">是否在 Spotify App 中打开该内容？</div>
            <div style="display:flex;gap:10px;">
                <button onclick="document.getElementById('wx-spotify-mask').style.display='none'" style="flex:1;padding:10px 0;background:transparent;border:1px solid #535353;color:#b3b3b3;border-radius:20px;font-size:14px;cursor:pointer;">留在微信</button>
                <a id="wx-open-btn" href="${appScheme}" style="flex:1;padding:10px 0;background:#1DB954;border:none;color:#fff;border-radius:20px;font-size:14px;font-weight:bold;text-decoration:none;display:inline-block;line-height:20px;">立即打开</a>
            </div>
        </div>
    </div>
    <script>
    document.getElementById('wx-open-btn').addEventListener('click', function(e) {
        setTimeout(function() {
            window.location.href = "${appScheme}";
        }, 50);
    });
    </script>
    `;

    // 注入页面
    body = body.replace(/(<body[^>]*>)/i, `$1${modalHtml}`);
    $done({ body: body });
} else {
    $done({});
}