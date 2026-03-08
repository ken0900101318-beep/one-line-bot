// Google Sheets 資料讀取模組
const axios = require('axios');
const config = require('./config');

// 快取設定（避免頻繁請求）
let cachedSettings = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘

/**
 * 從 Google Sheets 讀取店家設定
 */
async function loadStoreSettings() {
  // 檢查快取
  if (cachedSettings && (Date.now() - cacheTime < CACHE_DURATION)) {
    console.log('[Sheets] 使用快取資料');
    return cachedSettings;
  }

  try {
    console.log('[Sheets] 從 Google Sheets 載入設定...');
    
    // 讀取 CSV 格式資料（公開分享連結）
    const response = await axios.get(config.sheets.csvUrl, {
      timeout: 10000,
    });

    const csvData = response.data;
    const settings = parseCSV(csvData);

    // 更新快取
    cachedSettings = settings;
    cacheTime = Date.now();

    console.log(`[Sheets] 載入完成，共 ${settings.stores.length} 家店`);
    return settings;

  } catch (error) {
    console.error('[Sheets] 讀取失敗:', error.message);
    
    // 如果有舊快取，繼續使用
    if (cachedSettings) {
      console.log('[Sheets] 使用舊快取資料');
      return cachedSettings;
    }

    // 回傳預設值
    return getDefaultSettings();
  }
}

/**
 * 解析 CSV 資料
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const stores = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const store = {};
    
    headers.forEach((header, index) => {
      store[header.trim()] = values[index]?.trim() || '';
    });
    
    stores.push(store);
  }

  return {
    stores,
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * 根據店名搜尋店家設定
 */
function findStore(settings, storeName) {
  if (!settings || !settings.stores) return null;

  // 模糊比對店名
  const searchName = storeName.toLowerCase().replace(/\s/g, '');
  
  return settings.stores.find(store => {
    const name = (store['店家名稱'] || '').toLowerCase().replace(/\s/g, '');
    return name.includes(searchName) || searchName.includes(name);
  });
}

/**
 * 取得預設設定
 */
function getDefaultSettings() {
  return {
    stores: [
      {
        '店家名稱': '範例店',
        '地址': '台灣',
        '客服電話': '0970-199296',
        '客服時間': '12:00-24:00',
        'Wifi密碼': '88888888',
        '開放區價格': '200',
        '小包廂價格': '250',
        '大包廂價格': '350',
        '退單限制_小時': '1',
        '退單扣款': '否',
        'AI個性': '尊榮管家風',
      }
    ],
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * 清除快取（手動重新載入時使用）
 */
function clearCache() {
  cachedSettings = null;
  cacheTime = 0;
  console.log('[Sheets] 快取已清除');
}

module.exports = {
  loadStoreSettings,
  findStore,
  clearCache,
};
