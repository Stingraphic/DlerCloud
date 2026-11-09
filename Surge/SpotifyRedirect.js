/**
 * Spotify Redirect for Surge (符合官方规范标准版)
 */
let headers = $request.headers || {};
let ua = "";
for (let key in headers) {
    if (key.toLowerCase() === "user-agent") {
        ua = headers[key];
        break;
    }
}

let isWeChat = /micromessenger/i.test(ua);
let body = $response.body;
let url = $request.url;

// 非微信环境或空响应体时，传空对象原样放行
if (!isWeChat || !body) {
    $done({});
} else {
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

    // 自动将缩略图哈希升级为 640x640 原画大图
    if (image.includes("i.scdn.co/image/")) {
        image = image.replace(/ab67616d0000(1e02|4851)/g, "ab67616d0000b273");
    }

    // 3. 补齐 Surge 标准通知（点击通知打开 scheme）
    if (typeof $notification !== "undefined") {
        $notification.post("正在打开 Spotify", title, "微信已拦截跳转，请轻点此通知直接打开", appScheme);
    }

    // 4. 构建暗黑黄金居中卡片
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
            overflow: hidden;
        }
        .wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: -32px;
            padding: 0 20px;
        }
        .brand-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 20px;
        }
        .spotify-icon {
            width: 30px;
            height: 30px;
            fill: #1DB954;
        }
        .brand-text {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        .cover-box {
            width: 76vw;
            height: 76vw;
            max-width: 300px;
            max-height: 300px;
            margin-bottom: 22px;
            box-shadow: 0 16px 40px rgba(0,0,0,0.75);
            border-radius: 12px;
            overflow: hidden;
            background-color: #242424;
            flex-shrink: 0;
        }
        .cover-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .info-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
            max-width: 330px;
        }
        .track-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 6px;
            color: #ffffff;
            line-height: 1.3;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .track-desc {
            font-size: 13.5px;
            color: #b3b3b3;
            margin-bottom: 22px;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .btn-open {
            background-color: #1DB954;
            color: #000;
            font-size: 15px;
            font-weight: 700;
            padding: 13px 40px;
            border-radius: 500px;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 4px 14px rgba(29, 185, 84, 0.3);
        }
        .btn-open:active {
            transform: scale(0.96);
            opacity: 0.9;
        }
        .tip {
            margin-top: 14px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="brand-header">
            <svg class="spotify-icon" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span class="brand-text">Spotify</span>
        </div>
        <div class="cover-box">
            <img class="cover-img" src="${image}" alt="Cover" />
        </div>
        <div class="info-box">
            <div class="track-title">${title}</div>
            <div class="track-desc">${desc}</div>
            <a class="btn-open" href="${appScheme}">在 Spotify 中打开</a>
            <div class="tip">轻点屏幕顶部横幅通知亦可直接跳转</div>
        </div>
    </div>
</body>
</html>`;

    // 5. Surge 标准平铺返回格式
    $done({
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8"
        },
        body: mobilePage
    });
}