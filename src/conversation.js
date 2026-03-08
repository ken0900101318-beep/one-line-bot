// 對話記憶管理模組
// 使用記憶體儲存（簡易版，適合小規模使用）

// 儲存格式：{ userId: { history: [...], lastStore: '店名', waitingForStore: false } }
const conversations = new Map();

// 對話記憶保留時間（30 分鐘）
const CONVERSATION_TIMEOUT = 30 * 60 * 1000;

/**
 * 取得用戶的對話歷史
 */
function getConversation(userId) {
  const conv = conversations.get(userId);
  
  if (!conv) {
    return { 
      history: [], 
      lastStore: null,
      waitingForStore: false,
      askedStoreList: false 
    };
  }
  
  // 檢查是否過期
  if (Date.now() - conv.lastUpdate > CONVERSATION_TIMEOUT) {
    conversations.delete(userId);
    return { 
      history: [], 
      lastStore: null,
      waitingForStore: false,
      askedStoreList: false 
    };
  }
  
  return conv;
}

/**
 * 新增對話訊息
 */
function addMessage(userId, role, content) {
  let conv = conversations.get(userId);
  
  if (!conv) {
    conv = {
      history: [],
      lastStore: null,
      waitingForStore: false,
      askedStoreList: false,
      lastUpdate: Date.now(),
    };
  }
  
  // 新增訊息
  conv.history.push({ role, content });
  conv.lastUpdate = Date.now();
  
  // 限制歷史長度（最多保留 10 輪對話）
  if (conv.history.length > 20) { // 10輪 = 20條訊息（用戶+助手）
    conv.history = conv.history.slice(-20);
  }
  
  conversations.set(userId, conv);
  
  console.log(`[Conversation] 用戶 ${userId} 對話歷史: ${conv.history.length} 條訊息`);
}

/**
 * 設定用戶最後詢問的店家
 */
function setLastStore(userId, storeName) {
  const conv = getConversation(userId);
  conv.lastStore = storeName;
  conv.waitingForStore = false; // 已經選定店家，不再等待
  conv.lastUpdate = Date.now();
  conversations.set(userId, conv);
  
  console.log(`[Conversation] 用戶 ${userId} 鎖定店家: ${storeName}`);
}

/**
 * 設定「等待用戶選店」狀態
 */
function setWaitingForStore(userId, waiting = true) {
  const conv = getConversation(userId);
  conv.waitingForStore = waiting;
  conv.askedStoreList = waiting; // 已經詢問過店家清單
  conv.lastUpdate = Date.now();
  conversations.set(userId, conv);
  
  console.log(`[Conversation] 用戶 ${userId} 等待選店狀態: ${waiting}`);
}

/**
 * 清除用戶對話
 */
function clearConversation(userId) {
  conversations.delete(userId);
  console.log(`[Conversation] 清除用戶 ${userId} 對話歷史`);
}

/**
 * 清理過期對話（定期執行）
 */
function cleanupExpired() {
  const now = Date.now();
  let count = 0;
  
  for (const [userId, conv] of conversations.entries()) {
    if (now - conv.lastUpdate > CONVERSATION_TIMEOUT) {
      conversations.delete(userId);
      count++;
    }
  }
  
  if (count > 0) {
    console.log(`[Conversation] 清理了 ${count} 個過期對話`);
  }
}

// 每 10 分鐘清理一次過期對話
setInterval(cleanupExpired, 10 * 60 * 1000);

module.exports = {
  getConversation,
  addMessage,
  setLastStore,
  setWaitingForStore,
  clearConversation,
};
