// 对话记忆管理模块
// 使用内存储存（简易版，适合小规模使用）

// 储存格式：{ userId: { history: [...], lastStore: '店名' } }
const conversations = new Map();

// 对话记忆保留时间（30 分钟）
const CONVERSATION_TIMEOUT = 30 * 60 * 1000;

/**
 * 取得用户的对话历史
 */
function getConversation(userId) {
  const conv = conversations.get(userId);
  
  if (!conv) {
    return { history: [], lastStore: null };
  }
  
  // 检查是否过期
  if (Date.now() - conv.lastUpdate > CONVERSATION_TIMEOUT) {
    conversations.delete(userId);
    return { history: [], lastStore: null };
  }
  
  return conv;
}

/**
 * 添加对话消息
 */
function addMessage(userId, role, content) {
  let conv = conversations.get(userId);
  
  if (!conv) {
    conv = {
      history: [],
      lastStore: null,
      lastUpdate: Date.now(),
    };
  }
  
  // 添加消息
  conv.history.push({ role, content });
  conv.lastUpdate = Date.now();
  
  // 限制历史长度（最多保留 10 轮对话）
  if (conv.history.length > 20) { // 10轮 = 20条消息（用户+助手）
    conv.history = conv.history.slice(-20);
  }
  
  conversations.set(userId, conv);
  
  console.log(`[Conversation] 用户 ${userId} 对话历史: ${conv.history.length} 条消息`);
}

/**
 * 设置用户最后询问的店家
 */
function setLastStore(userId, storeName) {
  const conv = getConversation(userId);
  conv.lastStore = storeName;
  conv.lastUpdate = Date.now();
  conversations.set(userId, conv);
  
  console.log(`[Conversation] 用户 ${userId} 锁定店家: ${storeName}`);
}

/**
 * 清除用户对话
 */
function clearConversation(userId) {
  conversations.delete(userId);
  console.log(`[Conversation] 清除用户 ${userId} 对话历史`);
}

/**
 * 清理过期对话（定期执行）
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
    console.log(`[Conversation] 清理了 ${count} 个过期对话`);
  }
}

// 每 10 分钟清理一次过期对话
setInterval(cleanupExpired, 10 * 60 * 1000);

module.exports = {
  getConversation,
  addMessage,
  setLastStore,
  clearConversation,
};
