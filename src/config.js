// ONE桌遊 LINE Bot 設定檔
require('dotenv').config();

module.exports = {
  // LINE Bot
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'DNwqhVdUGRh9+oDy2B0gV/1qu2dpYWK8NHV3MvTfl6NMhK1pp8oNXmSWunuXOdHr78rqmSYByfLFi/fbSmRNbYhJg2LcNCY4M/IoBCFdXCeAFmtReKN+KKK461LWIRSoV3YxJS7AN1X1IzUZLfZX5AdB04t89/1O/w1cDnyilFU=',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  },

  // Google Sheets
  sheets: {
    // Google Sheets ID（部署後填入）
    spreadsheetId: process.env.SHEETS_ID || '',
    // Google Sheets 公開網址（將 /edit 改為 /export?format=csv&gid=0）
    csvUrl: process.env.SHEETS_CSV_URL || '',
  },

  // Claude AI
  ai: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 1024,
  },

  // 伺服器
  server: {
    port: process.env.PORT || 3000,
  },
};
