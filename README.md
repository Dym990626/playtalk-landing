# PlayTalk Landing Site

中英双版落地页，用于验证两件事：

1. 中国玩家是否愿意用游戏场景练英语；
2. 美国游戏/anime 用户是否愿意用游戏场景练日语。

站点是纯静态 HTML/CSS/JS，不需要构建工具，可以直接部署到 Netlify、Cloudflare Pages、Vercel 或任意静态托管。

---

## 文件结构

```text
playtalk-site/
├── index.html                 # 语言选择页
├── cn/index.html              # 中国版落地页
├── us/index.html              # 美国版落地页
├── assets/
│   ├── app.js                 # UTM、表单、A/B、事件追踪
│   ├── config.js              # 表单接口与配置
│   ├── styles.css             # 全站样式
│   └── favicon.svg            # 站点图标
├── legal/
│   ├── privacy.html           # 隐私政策模板
│   └── terms.html             # 服务条款模板
└── README.md
```

---

## 一、本地预览

### macOS 直接打开

```bash
open /Users/yishujia/Documents/Codex/2026-09-12/n/outputs/playtalk-site/index.html
```

### 使用本地服务器

如果 Ruby 的 WEBrick 可用：

```bash
cd /Users/yishujia/Documents/Codex/2026-09-12/n/outputs/playtalk-site
ruby -run -e httpd . -p 8080
```

然后访问：

```text
http://localhost:8080
```

注意：在本地 demo 模式下，表单数据只保存在浏览器 localStorage，不会发送给你。  
这是为了先验证页面，不代表可以正式收集用户。

---

## 二、上线前必须修改

### 1. 配置表单接口

打开 `assets/config.js`：

```js
window.PLAY_TALK_CONFIG = {
  formEndpoint: "",
  contactEmail: "hello@playtalk.gg"
};
```

推荐使用 Formspree：

1. 注册 Formspree 免费账号；
2. 新建一个表单，例如 `PlayTalk Waitlist`；
3. 复制 endpoint；
4. 填入 `formEndpoint`：

```js
formEndpoint: "https://formspree.io/f/xxxxxxxx"
```

表单提交后会发送完整 JSON，包含：

- 姓名或昵称
- 邮箱或微信
- 语言水平
- 学习目标
- 常玩游戏
- 是否参加 7 天挑战
- UTM 来源
- 页面路径
- 来源网站
- 变体版本

也可以替换成：

- Make / Zapier Webhook
- Airtable API
- Google Apps Script
- 自建 API

### 2. 修改联系方式和域名

搜索并替换：

```text
hello@playtalk.gg
playtalk.gg
```

涉及文件：

```text
assets/config.js
cn/index.html
us/index.html
legal/privacy.html
legal/terms.html
```

### 3. 替换法律模板

`legal/privacy.html` 和 `legal/terms.html` 只是模板，不是法律意见。  
正式上线前至少需要：

- 公司主体和地址
- 数据处理方式
- 第三方服务商列表
- Cookie 和分析说明
- 中国大陆用户相关合规说明
- 美国加州用户权利说明
- 未成年人政策
- 退款和订阅条款
- 专业律师审核

### 4. 补充真实社会证明

当前页面没有伪造用户数或评价。  
有真实内测数据后，再增加：

- 内测用户数量
- 用户评价
- KOL 合作案例
- 媒体或社群背书

---

## 三、部署方式

### 方案 A：Netlify Drop（最快）

1. 打开 Netlify Drop；
2. 把 `playtalk-site` 文件夹拖进去；
3. 等待部署完成；
4. 在 Netlify 设置里绑定自定义域名；
5. 配置 Formspree endpoint 后重新部署。

### 方案 B：Cloudflare Pages

1. 把站点推送到 GitHub；
2. 在 Cloudflare Pages 连接仓库；
3. Build command 留空；
4. Output directory 填 `playtalk-site`；
5. 绑定域名。

### 方案 C：Vercel

1. 推送 GitHub 仓库；
2. 导入 Vercel；
3. Framework preset 选择 Other；
4. 部署目录设置为 `playtalk-site`；
5. 绑定域名。

### 方案 D：任何静态服务器

把 `playtalk-site` 里的所有文件上传到网站根目录即可。

---

## 四、UTM 追踪

站点会自动读取并保存这些参数：

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

首次带 UTM 进入后，会存入浏览器 localStorage。  
用户之后提交表单时，会一并发送第一次归因信息。

### 测试链接

中国版：

```text
https://你的域名/cn/?utm_source=douyin&utm_medium=paid&utm_campaign=cn_en_launch&utm_content=script_01&utm_term=hook_a
```

美国版：

```text
https://你的域名/us/?utm_source=tiktok&utm_medium=paid&utm_campaign=us_jp_launch&utm_content=script_11&utm_term=hook_a
```

### 建议命名规则

```text
utm_source: douyin / bilibili / xiaohongshu / tiktok / youtube / twitch / discord / kol
utm_medium: paid / organic / affiliate / email
utm_campaign: cn_en_launch / us_jp_launch
utm_content: script_01 到 script_20
utm_term: hook_a / hook_b / hook_c
```

---

## 五、A/B 测试

pages 支持两个主标题版本：

```text
/cn/?v=a
/cn/?v=b
/us/?v=a
/us/?v=b
```

系统会把 `v` 参数写入：

- `page_variant` 隐藏字段
- 提交数据
- 页面事件

建议测试：

| 测试 | A | B |
|---|---|---|
| 中国主标题 | 外服开黑，不用再只会说 yes | 每天 10 分钟，像打游戏一样练口语 |
| 美国主标题 | Learn Japanese through games | Your AI squad is also your Japanese coach |
| CTA | 免费体验第一局 | 加入内测 |
| CTA EN | Start your first quest free | Join the beta |
| 价格锚点 | 月付优先 | 年付优先 |
| 表单长度 | 仅联系方式 | 联系方式 + 问卷 |

---

## 六、事件追踪

站点会触发这些事件：

```text
page_view
cta_click
waitlist_submit
waitlist_success
```

事件会发送到：

- `window.dataLayer`（如果页面已加载 GTM）
- `window.posthog`（如果在 `config.js` 配置 PostHog）
- `playtalk:track` 自定义事件

如果需要接 PostHog：

```js
window.PLAY_TALK_CONFIG = {
  formEndpoint: "",
  posthogKey: "phc_xxxxxxxx",
  posthogHost: "https://us.i.posthog.com"
};
```

如果需要接 Google Tag Manager：  
在 HTML 的 `<head>` 中加入 GTM 代码，并确保 `window.dataLayer` 已初始化。

---

## 七、上线前 QA

- [ ] 手机端首屏 3 秒内可读
- [ ] 中国版和美国版没有串语言
- [ ] 所有 CTA 都能滚动到等待名单
- [ ] 表单必填校验正常
- [ ] 邮箱格式校验正常
- [ ] 提交后有成功提示
- [ ] 后台能看到带 UTM 的提交
- [ ] 隐私政策和服务条款可访问
- [ ] 微信内置浏览器测试通过
- [ ] TikTok / Instagram 内置浏览器测试通过
- [ ] 中国大陆和美国网络速度分别测试
- [ ] 真实用户数据出现前，不展示虚构评价

---

## 八、每天要看的数据

```text
广告花费
3 秒完播率
CTR
落地页注册率
首次体验预约率
每个注册成本
中国注册数
美国注册数
7 天挑战报名数
付费内测意向数
```

前 3 天不要急着做大预算。  
先看中国版和美国版哪个注册成本更低、哪个提交率更高，再决定下一步把预算放在哪边。

---

## 九、Beta 阶段的 noindex

为了避免内测页面被搜索引擎误收录，以下页面当前都带有：

```html
<meta name="robots" content="noindex,nofollow">
```

文件位置：

```text
index.html
cn/index.html
us/index.html
```

正式上线并准备做自然搜索流量时，删除这三处 meta 标签，或在部署平台上改为正式索引设置。
