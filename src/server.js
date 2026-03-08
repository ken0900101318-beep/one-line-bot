// ONE桌遊 LINE Bot 主伺服器
const express = require('express');
const line = require('@line/bot-sdk');
const config = require('./config');
const { loadStoreSettings, findStore } = require('./sheets');
const { generateReply } = require('./ai');

const app = express();

// LINE Bot 設定
const lineConfig = {
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret,
};

const client = new line.Client(lineConfig);

// 健康檢查
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'ONE桌遊 LINE Bot',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// LINE Webhook
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    
    // 快速回應 200 OK
    res.status(200).end();
    
    // 處理事件
    await Promise.all(events.map(handleEvent));
    
  } catch (error) {
    console.error('[Webhook] 處理錯誤:', error);
    res.status(500).end();
  }
});

/**
 * 處理 LINE 事件
 */
async function handleEvent(event) {
  // 只處理文字訊息
  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('[Event] 略過非文字訊息');
    return null;
  }

  const userMessage = event.message.text;
  const userId = event.source.userId;

  console.log(`[Message] 收到訊息: ${userMessage}`);
  console.log(`[User] ID: ${userId}`);

  try {
    // 載入店家設定
    const settings = await loadStoreSettings();
    
    // 偵測店家（直接用訊息內容搜尋）
    const storeInfo = findStore(settings, userMessage);

    if (!storeInfo) {
      console.log('[Store] 未偵測到特定店家，讓 AI 自行判斷');
    } else {
      console.log(`[Store] 偵測到店家: ${storeInfo['店家名稱']}`);
    }

    // 使用 AI 產生回覆（傳入完整的店家清單 + 偵測到的店家）
    const replyText = await generateReply(userMessage, storeInfo, settings);

    // 回覆訊息
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText,
    });

    console.log('[Reply] 訊息已送出');

  } catch (error) {
    console.error('[Event] 處理失敗:', error);
    
    // 錯誤回覆
    try {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: '抱歉，系統暫時無法處理您的訊息。請稍後再試或撥打客服專線：0986-995673',
      });
    } catch (replyError) {
      console.error('[Reply] 錯誤回覆失敗:', replyError);
    }
  }
}

// 啟動伺服器
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ONE桌遊 LINE Bot 智能客服系統');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 伺服器運行中: http://localhost:${PORT}`);
  console.log(`📡 Webhook 路徑: /webhook`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 預載店家設定
  loadStoreSettings()
    .then(() => console.log('✅ 店家設定已預載'))
    .catch(err => console.error('❌ 店家設定預載失敗:', err.message));
});
