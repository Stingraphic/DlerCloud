/**
 * Spotify Redirect for WeChat
 * 彻底修复 Shadowrocket 通知跳转参数，点击通知直达 Spotify App
 */
let body = $response.body;
let url = $request.url;

if (body && /<html/i.test(body)) {
    let appScheme = "spotify://";
    let targetWebUrl = url;

    // 1. 提取 Spotify 链接的类型与 ID
    let match = url.match(/open\.spotify\.com\/(track|album|artist|playlist|show|episode)\/([a-zA-Z0-9]+)/i);
    if (match) {
        appScheme = `spotify://${match[1]}/${match[2]}`;
    } else {
        let schemeMatch = body.match(/spotify:\/\/(track|album|artist|playlist|show|episode)\/[a-zA-Z0-9]+/i);
        if (schemeMatch) {
            appScheme = schemeMatch[0];
            let parts = appScheme.replace("spotify://", "").split("/");
            targetWebUrl = `https://open.spotify.com/${parts[0]}/${parts[1]}`;
        }
    }

    // 2. 关键修复：Shadowrocket 原生识别的 action 与 open-url / url 结构
    // 传入原生 Scheme，点击横幅让 iOS 系统直接唤醒 Spotify
    $notification.post(
        "前往 Spotify",
        "轻点直接切入 App 播放",
        "点击此横幅即可立即切出微信",
        {
            "action": "open-url",
            "url": appScheme,
            "open-url": appScheme
        }
    );

    // 3. 页面彻底替换为深色简约卡片，干掉原来的引导页
    let cleanPage = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Spotify</title>
    <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #121212 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .card {
            background: #282828;
            width: 84%;
            max-width: 320px;
            border-radius: 18px;
            padding: 26px 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        }
        .icon {
            width: 52px;
            height: 52px;
            background: #1DB954;
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .title {
            color: #fff;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .desc {
            color: #b3b3b3;
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 22px;
        }
        .btn-box {
            display: flex;
            gap: 12px;
        }
        .btn-cancel {
            flex: 1;
            padding: 10px 0;
            background: transparent;
            border: 1px solid #535353;
            color: #b3b3b3;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
        }
        .btn-go {
            flex: 1;
            padding: 10px 0;
            background: #1DB954;
            border: none;
            color: #fff;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.