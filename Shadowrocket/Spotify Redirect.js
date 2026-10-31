let body = $response.body;

if (body && /<html/i.test(body)) {
    let url = $request.url;
    let match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    
    if (match) {
        let type = match[1];
        let id = match[2];
        let appScheme = `spotify://${type}/${id}`;
        
        let injectHtml = `
        <div id="wx-spotify-bar" style="position:fixed;top:0;left:0;width:100%;z-index:999999;background:#1DB954;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
            <span style="color:#fff;font-size:14px;font-weight:bold;">正在前往 Spotify App...</span>
            <a id="wx-spotify-btn" href="${appScheme}" style="background:#000;color:#fff;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:bold;text-decoration:none;">立即打开</a>
        </div>
        <script>
        (function() {
            function launch() {
                var btn = document.getElementById('wx-spotify-btn');
                if (btn) btn.click();
                window.location.href = "${appScheme}";
            }
            // 页面加载完成后立即尝试触发
            if (document.readyState === 'complete') {
                launch();
            } else {
                window.addEventListener('load', launch);
            }
        })();
        </script>
        `;
        
        body = body.replace(/(<body[^>]*>)/i, `$1${injectHtml}`);
        $done({ body: body });
    } else {
        $done({});
    }
} else {
    $done({});
}
