// 阅读统计系统
// 小龙虾项目 - Phase 3

const ReadStats = {
  // 存储键名
  STORAGE_KEY: 'lobster_read_stats',
  USER_HISTORY_KEY: 'lobster_read_history',
  
  // 初始化
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.USER_HISTORY_KEY)) {
      localStorage.setItem(this.USER_HISTORY_KEY, JSON.stringify([]));
    }
  },
  
  // 记录阅读
  recordRead(docId, userId = 'anonymous', progress = 0) {
    const stats = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const history = JSON.parse(localStorage.getItem(this.USER_HISTORY_KEY) || '[]');
    
    // 更新文档统计
    if (!stats[docId]) {
      stats[docId] = {
        views: 0,
        readers: [],
        totalProgress: 0,
        avgProgress: 0
      };
    }
    
    // 增加阅读次数
    stats[docId].views++;
    
    // 记录阅读者
    if (!stats[docId].readers.includes(userId)) {
      stats[docId].readers.push(userId);
    }
    
    // 更新进度
    stats[docId].totalProgress += progress;
    stats[docId].avgProgress = Math.round(stats[docId].totalProgress / stats[docId].views);
    
    // 更新阅读历史
    const historyItem = {
      docId,
      userId,
      progress,
      timestamp: new Date().toISOString()
    };
    
    // 移除同一文档的旧记录
    const existingIndex = history.findIndex(h => h.docId === docId && h.userId === userId);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    
    // 添加到开头
    history.unshift(historyItem);
    
    // 限制历史记录数量
    if (history.length > 100) {
      history.pop();
    }
    
    // 保存
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    localStorage.setItem(this.USER_HISTORY_KEY, JSON.stringify(history));
    
    return { success: true, views: stats[docId].views };
  },
  
  // 获取文档阅读统计
  getDocStats(docId) {
    const stats = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return stats[docId] || { views: 0, readers: [], avgProgress: 0 };
  },
  
  // 获取文档阅读量
  getDocViews(docId) {
    return this.getDocStats(docId).views;
  },
  
  // 获取文档阅读人数
  getDocReaders(docId) {
    return this.getDocStats(docId).readers;
  },
  
  // 获取文档平均阅读进度
  getDocAvgProgress(docId) {
    return this.getDocStats(docId).avgProgress;
  },
  
  // 获取用户阅读历史
  getUserHistory(userId = 'anonymous') {
    const history = JSON.parse(localStorage.getItem(this.USER_HISTORY_KEY) || '[]');
    return history.filter(h => h.userId === userId);
  },
  
  // 获取热门文档（按阅读量排序）
  getHotDocs(limit = 10) {
    const stats = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    
    return Object.entries(stats)
      .map(([docId, data]) => ({ 
        docId, 
        views: data.views,
        readers: data.readers.length,
        avgProgress: data.avgProgress
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },
  
  // 获取最近阅读
  getRecentReads(limit = 10) {
    const history = JSON.parse(localStorage.getItem(this.USER_HISTORY_KEY) || '[]');
    return history.slice(0, limit);
  },
  
  // 获取阅读趋势（最近7天）
  getReadTrend(days = 7) {
    const history = JSON.parse(localStorage.getItem(this.USER_HISTORY_KEY) || '[]');
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = history.filter(h => h.timestamp.startsWith(dateStr)).length;
      trend.push({ date: dateStr, count });
    }
    
    return trend;
  },
  
  // 格式化阅读量
  formatViews(views) {
    if (views >= 10000) {
      return (views / 10000).toFixed(1) + 'w';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'k';
    }
    return views.toString();
  },
  
  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN');
  },
  
  // 生成阅读报告
  generateReport(userId = 'anonymous') {
    const history = this.getUserHistory(userId);
    const totalReads = history.length;
    const totalProgress = history.reduce((sum, h) => sum + h.progress, 0);
    const avgProgress = totalReads > 0 ? Math.round(totalProgress / totalReads) : 0;
    
    // 最常阅读的文档
    const docFrequency = {};
    history.forEach(h => {
      docFrequency[h.docId] = (docFrequency[h.docId] || 0) + 1;
    });
    
    const favoriteDoc = Object.entries(docFrequency)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalReads,
      avgProgress,
      favoriteDoc: favoriteDoc ? favoriteDoc[0] : null,
      readTrend: this.getReadTrend(7)
    };
  },
  
  // 导出数据
  exportData() {
    return {
      stats: JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'),
      history: JSON.parse(localStorage.getItem(this.USER_HISTORY_KEY) || '[]')
    };
  },
  
  // 导入数据
  importData(data) {
    if (data.stats) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.stats));
    }
    if (data.history) {
      localStorage.setItem(this.USER_HISTORY_KEY, JSON.stringify(data.history));
    }
  },
  
  // 清空数据
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.USER_HISTORY_KEY);
    this.init();
  }
};

// 初始化
ReadStats.init();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReadStats;
}

// 全局可用
window.ReadStats = ReadStats;

// 页面阅读跟踪
let currentDocId = null;
let readStartTime = null;
let readProgress = 0;

// 开始跟踪阅读
function startReadingTracking(docId) {
  currentDocId = docId;
  readStartTime = Date.now();
  readProgress = 0;
  
  // 监听滚动
  window.addEventListener('scroll', updateReadProgress);
  
  // 页面关闭时记录
  window.addEventListener('beforeunload', () => {
    if (currentDocId) {
      ReadStats.recordRead(currentDocId, 'anonymous', readProgress);
    }
  });
}

// 更新阅读进度
function updateReadProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  readProgress = Math.min(100, Math.round((scrollTop / docHeight) * 100));
  
  // 更新进度条
  const progressBar = document.getElementById('readProgressBar');
  if (progressBar) {
    progressBar.style.width = readProgress + '%';
  }
}

// 初始化阅读统计 UI
function initReadStats() {
  // 更新所有文档的阅读量显示
  document.querySelectorAll('[data-doc-views]').forEach(el => {
    const docId = el.dataset.docViews;
    const views = ReadStats.getDocViews(docId);
    el.textContent = ReadStats.formatViews(views);
  });
  
  // 更新阅读时间
  document.querySelectorAll('[data-read-time]').forEach(el => {
    const timestamp = el.dataset.readTime;
    el.textContent = ReadStats.formatTime(timestamp);
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initReadStats);

// 示例用法：
// ReadStats.recordRead('doc_001', 'user_001', 85);
// ReadStats.getDocStats('doc_001');
// ReadStats.getHotDocs(5);
// ReadStats.getUserHistory('user_001');
// ReadStats.generateReport('user_001');
