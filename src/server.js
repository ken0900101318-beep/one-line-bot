// ONE桌遊 LINE Bot 主伺服器
const express = require('express');
const line = require('@line/bot-sdk');
const config = require('./config');
const { loadStoreSettings, findStore } = require('./sheets');
const { generateReply } = require('./ai');
const { getConversation, addMessage, setLastStore, setWaitingForStore } = require('./conversation');

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
    version: '1.0.1',
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
    
    // 取得對話歷史
    const conversation = getConversation(userId);
    
    // 偵測店家（從訊息或對話記憶中）
    let storeInfo = findStore(settings, userMessage);
    
    // 如果訊息中沒找到，檢查對話記憶
    if (!storeInfo && conversation.lastStore) {
      storeInfo = settings.stores.find(s => s['店家名稱'] === conversation.lastStore);
      console.log(`[Store] 使用對話記憶中的店家: ${conversation.lastStore}`);
    }

    if (storeInfo) {
      console.log(`[Store] 鎖定店家: ${storeInfo['店家名稱']}`);
      // 更新對話記憶中的店家
      setLastStore(userId, storeInfo['店家名稱']);
    } else {
      console.log('[Store] 未鎖定特定店家');
      // 設定「等待選店」狀態（如果還沒設定過）
      if (!conversation.waitingForStore) {
        setWaitingForStore(userId, true);
      }
    }

    // 使用 AI 產生回覆（包含對話歷史和狀態）
    const replyText = await generateReply(
      userMessage, 
      storeInfo, 
      settings, 
      conversation.history,
      conversation.waitingForStore
    );

    // 記錄對話
    addMessage(userId, 'user', userMessage);
    addMessage(userId, 'assistant', replyText);

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
  console.log('  🧠 對話記憶功能已啟用');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 伺服器運行中: http://localhost:${PORT}`);
  console.log(`📡 Webhook 路徑: /webhook`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 預載店家設定
  loadStoreSettings()
    .then(() => console.log('✅ 店家設定已預載'))
    .catch(err => console.error('❌ 店家設定預載失敗:', err.message));
});
