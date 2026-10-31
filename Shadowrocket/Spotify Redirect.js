/**
 * Spotify Redirect for Shadowrocket (Mobile Card View with Logo)
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

    // 3. 发送直跳通知横幅
    $notification.post("正在打开 Spotify", title, "微信已拦截跳转，请轻点此通知直接打开", appScheme);

    // 4. 构建带顶部 Logo 的暗黑原生移动端卡片
    let mobilePage = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>${title}</title>
    <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #121212;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .container {
            width: 86%;
            max-width: 360px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .spotify-logo {
            width: 42px;
            height: 42px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cover-wrapper {
            width: 230px;
            height: 230px;
            margin-bottom: 22px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.7);
            border-radius: 8px;
            overflow: hidden;
            background-color: #282828;
        }
        .cover-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .track-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #ffffff;
            line-height: 1.3;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .track-desc {
            font-size: 14px;
            color: #b3b3b3;
            margin-bottom: 28px;
            line-height: 1.4;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .btn-open {
            background-color: #1DB954;
            color: #000;
            font-size: 15px;
            font-weight: 700;
            padding: 14px 36px;
            border-radius: 500px;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.1s ease;
        }
        .btn-open:active {
            transform: scale(0.96);
        }
        .tip {
            margin-top: 16px;
            font-size: 12px;
            color: #6a6a6a;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 顶部 Spotify Logo -->
        <div class="spotify-logo">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="#1DB954">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
        </div>

        <!-- 封面图 -->
        <div class="cover-wrapper">
            <img class="cover-img" src="${image}" alt="Cover" />
        </div>

        <!-- 标题与描述 -->
        <div class="track-title">${title}</div>
        <div class="track-desc">${desc}</div>

        <!-- 打开按钮 -->
        <a class="btn-open" href="${appScheme}">在 Spotify 中打开</a>
        <div class="tip">轻点屏幕顶部横幅通知亦可直接跳转</div>
    </div>
</body>
</html>`;

    $done({ body: mobilePage });
} else {
    $done({});
}