// AI 智能回覆模組
const axios = require('axios');
const config = require('./config');

/**
 * 使用 Claude AI 產生回覆
 */
async function generateReply(userMessage, storeInfo) {
  try {
    console.log(`[AI] 處理訊息: ${userMessage.substring(0, 50)}...`);

    // 建立系統提示（包含店家資訊）
    const systemPrompt = buildSystemPrompt(storeInfo);

    // 呼叫 Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: config.ai.model,
        max_tokens: config.ai.maxTokens,
        messages: [
          {
            role: 'user',
            content: userMessage,
          }
        ],
        system: systemPrompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.ai.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );

    const reply = response.data.content[0].text;
    console.log('[AI] 回覆生成成功');
    return reply;

  } catch (error) {
    console.error('[AI] 生成失敗:', error.message);
    return getFallbackReply(storeInfo);
  }
}

/**
 * 建立系統提示（包含店家資訊）
 */
function buildSystemPrompt(storeInfo) {
  const aiPersonality = storeInfo?.['AI個性'] || '尊榮管家風';
  const storeName = storeInfo?.['店家名稱'] || 'ONE桌遊';
  const phone = storeInfo?.['客服電話'] || '0970-199296';
  const serviceHours = storeInfo?.['客服時間'] || '12:00-24:00';

  let personalityPrompt = '';
  
  // 根據 AI 個性選擇回話風格
  switch (aiPersonality) {
    case '親切鄰家風':
      personalityPrompt = '語氣像朋友一樣自然親切，使用「您好」、「麻煩您」等禮貌用語，句尾可加語助詞（喔、呢、呀），適量使用 Emoji（😊, ❤️, ✨）';
      break;
    case '熱情小編風':
      personalityPrompt = '超級熱情、充滿活力，多用 🔥🚀🤩 符號，句尾使用「～囉」、「～滴」';
      break;
    case '呆萌吉祥物風':
      personalityPrompt = '自稱「本喵」，每句結尾加「喵～」或「喵嗚～」，軟萌、愛撒嬌，多用貓咪 Emoji（🐱, 🐾）';
      break;
    case '專業顧問風':
      personalityPrompt = '沉穩冷靜、邏輯清晰，用詞客觀、專業，避免過多 Emoji';
      break;
    case '尊榮管家風':
    default:
      personalityPrompt = '全程使用敬語（您、請、貴賓），用詞精簡優雅，避免過多 Emoji（頂多 ✨ 或 🙏），先講結論再補充細節';
  }

  return `你是 ${storeName} 的 AI 客服助理。

【核心身分】
- 這是 24 小時無人自助店
- 嚴禁提及「櫃台人員」「現場人員」等字眼
- 所有操作都是客人自助完成

【回話風格】
${personalityPrompt}

【店家資訊】
- 店名：${storeName}
- 客服電話：${phone}
- 客服時間：${serviceHours}
${storeInfo?.['地址'] ? `- 地址：${storeInfo['地址']}` : ''}
${storeInfo?.['Wifi密碼'] ? `- Wifi：${storeInfo['Wifi密碼']}` : ''}
${storeInfo?.['預約網址'] ? `- 預約網址：${storeInfo['預約網址']}` : ''}

【價格資訊】
${storeInfo?.['開放區價格'] ? `- 開放區：${storeInfo['開放區價格']}元/小時` : ''}
${storeInfo?.['小包廂價格'] ? `- 小包廂：${storeInfo['小包廂價格']}元/小時` : ''}
${storeInfo?.['大包廂價格'] ? `- 大包廂：${storeInfo['大包廂價格']}元/小時` : ''}

【退單政策】
- 提前 ${storeInfo?.['退單限制_小時'] || '1'} 小時可取消
- ${storeInfo?.['退單扣款'] === '是' ? '會扣 20% 手續費' : '不扣款'}

【優惠活動】
${storeInfo?.['當期活動'] ? `- ${storeInfo['當期活動']}` : '- 目前無特殊活動'}

【設備】
${storeInfo?.['飲料機'] === '有' ? '- 有飲料機' : ''}
${storeInfo?.['飲水機'] === '有' ? '- 有飲水機' : ''}

【回覆原則】
1. 字數控制在 150-200 字內
2. 優先解決問題，不要閒聊
3. 如果不確定答案，引導客人撥打客服電話
4. 嚴禁提及「找櫃台」「找人員」等字眼
5. 保持 ${aiPersonality} 的風格

請根據以上資訊回覆客人的問題。`;
}

/**
 * 取得備用回覆（AI 失敗時使用）
 */
function getFallbackReply(storeInfo) {
  const phone = storeInfo?.['客服電話'] || '0970-199296';
  const serviceHours = storeInfo?.['客服時間'] || '12:00-24:00';

  return `抱歉，系統暫時無法處理您的問題。

如需協助，請撥打客服專線：
📞 ${phone}
⏰ 服務時間：${serviceHours}

造成不便，敬請見諒。✨`;
}

module.exports = {
  generateReply,
};
