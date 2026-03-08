// Google Sheets 資料讀取模組
const axios = require('axios');
const { parse } = require('csv-parse/sync');
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
    
    // 列出所有店家名稱（debug）
    settings.stores.forEach((store, index) => {
      console.log(`[Sheets] 店家 ${index + 1}: ${store['店家名稱']}`);
    });
    
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
 * 解析 CSV 資料（使用專業解析器）
 */
function parseCSV(csvText) {
  try {
    // 使用 csv-parse 正確解析 CSV
    const records = parse(csvText, {
      columns: true, // 第一列為欄位名稱
      skip_empty_lines: true, // 跳過空白列
      trim: true, // 去除空白
      relax_column_count: true, // 允許欄位數量不一致
    });

    return {
      stores: records,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Sheets] CSV 解析失敗:', error.message);
    return getDefaultSettings();
  }
}

/**
 * 根據店名搜尋店家設定
 */
function findStore(settings, storeName) {
  if (!settings || !settings.stores) return null;

  const searchName = storeName.toLowerCase().replace(/\s+/g, '');
  
  // 完全匹配優先
  let store = settings.stores.find(s => {
    const name = (s['店家名稱'] || '').toLowerCase().replace(/\s+/g, '');
    return name === searchName;
  });

  if (store) {
    console.log(`[Sheets] 完全匹配: ${store['店家名稱']}`);
    return store;
  }

  // 模糊比對（包含關係）
  store = settings.stores.find(s => {
    const name = (s['店家名稱'] || '').toLowerCase().replace(/\s+/g, '');
    return name.includes(searchName) || searchName.includes(name);
  });

  if (store) {
    console.log(`[Sheets] 模糊匹配: ${store['店家名稱']}`);
    return store;
  }

  // 簡稱匹配（例如「一中」→「台中一中店」）
  store = settings.stores.find(s => {
    const name = (s['店家名稱'] || '').toLowerCase();
    return name.includes(searchName);
  });

  if (store) {
    console.log(`[Sheets] 簡稱匹配: ${store['店家名稱']}`);
  } else {
    console.log(`[Sheets] 找不到店家: ${storeName}`);
  }

  return store;
}

/**
 * 取得預設設定
 */
function getDefaultSettings() {
  return {
    stores: [
      {
        '店家名稱': 'ONE桌遊',
        '地址': '台灣',
        '客服電話': '0986-995673',
        '客服時間': '12:00-24:00',
        'Wifi密碼': '88888888',
        '開放區價格': '200',
        '小包廂價格': '250',
        '大包廂價格': '350',
        '退單限制_小時': '0',
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
