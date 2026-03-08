// quote-of-day Skill 示例
// 这是一个简单的入门级 Skill，展示如何创建自定义技能

/**
 * 名言数据库
 * 实际项目中可以从 API 获取或读取文件
 */
const QUOTES = [
  {
    text: "千里之行，始于足下",
    author: "老子",
    category: "励志"
  },
  {
    text: "学而不思则罔，思而不学则殆",
    author: "孔子",
    category: "学习"
  },
  {
    text: "天行健，君子以自强不息",
    author: "周易",
    category: "励志"
  },
  {
    text: "己所不欲，勿施于人",
    author: "孔子",
    category: "处世"
  },
  {
    text: "路漫漫其修远兮，吾将上下而求索",
    author: "屈原",
    category: "坚持"
  }
];

/**
 * 获取随机名言
 * @returns {Object} 名言对象
 */
function getRandomQuote() {
  const index = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[index];
}

/**
 * 按分类获取名言
 * @param {string} category - 分类名称
 * @returns {Object|null} 名言对象或 null
 */
function getQuoteByCategory(category) {
  const filtered = QUOTES.filter(q => q.category === category);
  if (filtered.length === 0) return null;
  
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}

/**
 * 获取每日名言（根据日期确定性选择）
 * @param {Date} date - 日期
 * @returns {Object} 名言对象
 */
function getDailyQuote(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % QUOTES.length;
  return QUOTES[index];
}

/**
 * 格式化输出
 * @param {Object} quote - 名言对象
 * @returns {string} 格式化后的字符串
 */
function formatQuote(quote) {
  return `📜 "${quote.text}"\n   —— ${quote.author}【${quote.category}】`;
}

/**
 * 主函数 - 获取名言
 * @param {Object} params - 参数
 * @param {string} params.type - 类型：random/daily/category
 * @param {string} params.category - 分类（可选）
 * @returns {string} 格式化的名言
 */
export async function getQuote(params = {}) {
  const { type = 'random', category } = params;
  
  let quote;
  
  switch (type) {
    case 'daily':
      quote = getDailyQuote();
      break;
    case 'category':
      quote = category ? getQuoteByCategory(category) : getRandomQuote();
      if (!quote) {
        return `❌ 未找到"${category}"分类的名言，可用分类：励志、学习、处世、坚持`;
      }
      break;
    case 'random':
    default:
      quote = getRandomQuote();
  }
  
  return formatQuote(quote);
}

/**
 * 列出所有可用分类
 * @returns {string} 分类列表
 */
export async function listCategories() {
  const categories = [...new Set(QUOTES.map(q => q.category))];
  return `📚 可用分类：${categories.join('、')}`;
}

/**
 * 添加新名言（示例，实际应持久化）
 * @param {Object} quote - 名言对象
 * @returns {string} 确认信息
 */
export async function addQuote(quote) {
  // 验证输入
  if (!quote.text || !quote.author) {
    return '❌ 名言必须包含 text 和 author';
  }
  
  // 添加默认分类
  const newQuote = {
    text: quote.text,
    author: quote.author,
    category: quote.category || '其他'
  };
  
  QUOTES.push(newQuote);
  
  return `✅ 已添加名言："${newQuote.text}"`;
}

// 导出所有函数
export { 
  getRandomQuote, 
  getQuoteByCategory, 
  getDailyQuote,
  listCategories,
  addQuote
};
