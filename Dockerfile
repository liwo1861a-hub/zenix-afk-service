FROM node:20-slim

# 安装 Puppeteer 运行 Chrome 所需的所有系统依赖动态库
RUN apt-get update \
    && apt-get install -y \
       wget gnupg ca-certificates procps libxss1 \
       libglib2.0-0 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
       libdrm2 libdbus-1-3 libxcb1 libxkbcommon0 libx11-6 libxcomposite1 \
       libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
       libcairo2 libasound2 fonts-liberation fonts-noto-color-emoji \
       --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
