# Dev Env Setup

## 一、本地代码修改

因为项目是一个 Telegram Mini-App，所以启动时会校验是否为 Telegram 执行环境，
如果不是Telegram打开，会无法初始化SDK执行异常。

如果本地环境测试，当前需要注释和 mock 掉相关代码，才能正常本地测试。

1. 全文搜索"todo remove t", 会有5个地方
2. 其中 "layout.tsx"需要注释掉
   "\<TMAProvider headers={headersForContext}" 和 "\</TMAProvider" 这2行
3. 其他文件中需要注释掉“const tgInitData = useInitData();”并打开“const tgInitData = { user: { id: 5499157826,
   username: '' } };”

因为Web服务器的CORS限制，需要根据具体环境来切换BASE_URL。
打开文件“art404_config.ts”，将下面这行的注释打开，其他冲突的BASE_URL注释掉。

```js 
export const BASE_URL: string = 'http://localhost:3000';
```

## 二、本地数据库

本项目使用了 CloudFlare D1 数据库，支持启动本地数据库。

1. 先注册一个 CloudFlare 账号，Google 账号登录即可。
2. 在本地命令行，执行如下语句新建本地数据库和新建表

```bash
npx wrangler d1 create d1-art404-prod

npx wrangler d1 execute d1-art404-prod --local --file=./db_schema/d1_user_init_schema.sql
npx wrangler d1 execute d1-art404-prod --local --file=./db_schema/d2_pink_market_schema.sql
```

将在本地环境创建 本地测试数据库。

## 三、执行测试

执行下面语句启动项目, 打开  http://localhost:3000 测试，在浏览器按 F12 打开开发者面板，再点击手机按钮切换到手机视图测试。

```bash
npm run dev
```

