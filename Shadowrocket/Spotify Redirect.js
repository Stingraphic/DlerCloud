let b = $response.body;
if (b) {
  let u = '';
  // 1. 完全按照原版的方式从微信的确认页提取真实目标 URL
  let m = b.match(/var url = '(.*?)';/);
  if (m && m[1]) {
    u = m[1];
  } else {
    let q = $request.url.match(/url=([^&]+)/);
    if (q && q[1]) u = decodeURIComponent(q[1]);
  }

  // 2. 核心过滤器：只有命中 open.spotify.com 才接管，其他链接全部跳过
  if (u && /open\.spotify\.com/i.test(u)) {
    // 3. 原版 UnblockURLinWeChat 的底层唤起调用
    let c = `
    <script>
    function go() {
      if (typeof WeixinJSBridge !== 'undefined' && WeixinJSBridge.invoke) {
        WeixinJSBridge.invoke('openUrlByBro', { 'url': '${u}' }, function(e){});
      } else {
        location.href = '${u}';
      }
    }
    if (typeof WeixinJSBridge === 'undefined') {
      document.addEventListener('WeixinJSBridgeReady', go, false);
    } else {
      go();
    }
    </script>`;

    // 4. 替换原网页的退出机制并注入自动跳转代码
    b = b.replace('/exit', u);
    b = b.replace(/<\/head>/i, c + '</head>');
    $done({ body: b });
  } else {
    // 非 Spotify 目标，直接放行保持微信原版行为
    $done({});
  }
} else {
  $done({});
}
