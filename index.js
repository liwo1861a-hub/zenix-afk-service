const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

const USER_COOKIE = process.env.ZENIX_COOKIE || 'session=a14673dd-da6e-437d-afb8-3f86e72a33ec; cf_clearance=y7hxCgnDQFhhKrNjZifU6y0oh1P9o5vcIXrzMCfS2UU-1789802055-1.2.1.1-I_tcS0WrUlu1DF_.9rlB2SuqLl7X.M3zZSInkP_mB45DStU42Wr943AGXxbiTsKTp8dOqs0EfirsbKVxa2HVhq9SYUUZsCq8RwQ6FckysMsrQ116GZxslZO10EaeK55InrAYWHK49eI_YaS8GhYakwcOsLWrmcsw126Dg9teW_ghevkjvL9qReroc.cO7bHm0TfgBn38sVyPmGp.rb3qEDIyy9mrvQGN9A4Aor25rX5fhb3RPpKAypTo0iT51EmwmEZh3HzsUXu9h.XIWC8WGQENskFJUbFUg.7oiybGMJrw_P03QYeYMFxPeEA6cU5Bpvsp2KS5NdR4tVwLi5fRBAmBiXyXaKOmFk9zRfXufdSvrfOpiz7Crj8qUwguG31_FCeKYEFeauRjpW79vKMTYg';
const USER_AGENT = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0';

let successCount = 0;
let failCount = 0;
let lastStatus = 'Initialized';
let lastProbeTime = null;

// Web 探活与状态查询接口
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'zenix-afk-service',
    uptime: `${Math.floor(process.uptime())}s`,
    successCount,
    failCount,
    lastStatus,
    lastProbeTime,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`[HTTP Server] Listening on port ${PORT}`);
});

async function sendProbe() {
  const ts = Date.now();
  const url = `https://dash.zenix.sg/api/ads/probe?ts=${ts}`;

  try {
    const res = await axios.get(url, {
      headers: {
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://dash.zenix.sg/dashboard/afk',
        'sec-ch-ua': '"Microsoft Edge";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': USER_AGENT,
        'cookie': USER_COOKIE
      },
      timeout: 10000
    });

    successCount++;
    lastStatus = `OK (HTTP ${res.status})`;
    lastProbeTime = new Date().toISOString();
    console.log(`[${new Date().toLocaleTimeString()}] Probe Success #${successCount} | Status: ${res.status}`);
  } catch (err) {
    failCount++;
    lastStatus = `Error: ${err.message}`;
    lastProbeTime = new Date().toISOString();
    if (err.response && err.response.status === 403) {
      console.error(`[${new Date().toLocaleTimeString()}] 403 Forbidden! Cookie might be expired.`);
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] Probe failed:`, err.message);
    }
  }

  // 间隔 30 秒 (加 500~2500ms 随机浮动)
  const nextInterval = 30000 + Math.floor(Math.random() * 2000);
  setTimeout(sendProbe, nextInterval);
}

// 延迟 2 秒后启动首次心跳
setTimeout(sendProbe, 2000);
