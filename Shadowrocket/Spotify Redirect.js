/**
 * Spotify Redirect for WeChat
 */
let body = $response.body;

if (body) {
    let targetUrl = "";
    
    // 提取微信拦截页面中的真实目标 URL
    let match = body.match(/var url = '(.*?)';/);
    if (match && match[1]) {
        targetUrl = match[1];
    } else {
        let q = $request.url.match(/url=([^&]+)/);
        if (q && q[1]) targetUrl = decodeURIComponent(q[1]);
    }

    // 仅在目标链接为 open.spotify.com 时执行微信底层唤起浏览器接口
    if (targetUrl && /open\.spotify\.com/i.test(targetUrl)) {
        let inject = `
        <script>
        function openInBrowser() {
            if (typeof WeixinJSBridge !== 'undefined' && WeixinJSBridge.invoke) {
                WeixinJSBridge.invoke('openUrlByBro', { 'url': '${targetUrl}' }, function(e){});
            } else {
                location.href = '${targetUrl}';
            }
        }
        if (typeof WeixinJSBridge === 'undefined') {
            document.addEventListener('WeixinJSBridgeReady', openInBrowser, false);
        } else {
            openInBrowser();
        }
        </script>`;

        body = body.replace('/exit', targetUrl);
        body = body.replace(/<\/head>/i, inject + '</head>');
        $done({ body: body });
    } else {
        // 非 Spotify 链接直接原样放行
        $done({});
    }
} else {
    $done({});
}
