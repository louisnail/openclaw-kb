// 点赞系统
// 小龙虾项目 - Phase 3

// 点赞数据存储
const LikeSystem = {
  // 存储键名
  STORAGE_KEY: 'lobster_likes',
  USER_LIKES_KEY: 'lobster_user_likes',
  
  // 初始化
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.USER_LIKES_KEY)) {
      localStorage.setItem(this.USER_LIKES_KEY, JSON.stringify([]));
    }
  },
  
  // 获取文档点赞数据
  getDocLikes(docId) {
    const likes = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return likes[docId] || { count: 0, users: [] };
  },
  
  // 获取用户点赞的文档列表
  getUserLikedDocs() {
    return JSON.parse(localStorage.getItem(this.USER_LIKES_KEY) || '[]');
  },
  
  // 检查用户是否点赞过
  hasUserLiked(docId, userId = 'anonymous') {
    const likes = this.getDocLikes(docId);
    return likes.users.includes(userId);
  },
  
  // 点赞
  like(docId, userId = 'anonymous') {
    if (this.hasUserLiked(docId, userId)) {
      return { success: false, message: '已经点赞过了' };
    }
    
    const likes = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const userLikes = JSON.parse(localStorage.getItem(this.USER_LIKES_KEY) || '[]');
    
    // 更新文档点赞数据
    if (!likes[docId]) {
      likes[docId] = { count: 0, users: [] };
    }
    likes[docId].count++;
    likes[docId].users.push(userId);
    
    // 更新用户点赞列表
    if (!userLikes.includes(docId)) {
      userLikes.push(docId);
    }
    
    // 保存
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(likes));
    localStorage.setItem(this.USER_LIKES_KEY, JSON.stringify(userLikes));
    
    // 触发事件
    this.triggerEvent('like', { docId, userId, count: likes[docId].count });
    
    return { success: true, count: likes[docId].count };
  },
  
  // 取消点赞
  unlike(docId, userId = 'anonymous') {
    if (!this.hasUserLiked(docId, userId)) {
      return { success: false, message: '还没有点赞' };
    }
    
    const likes = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const userLikes = JSON.parse(localStorage.getItem(this.USER_LIKES_KEY) || '[]');
    
    // 更新文档点赞数据
    if (likes[docId]) {
      likes[docId].count = Math.max(0, likes[docId].count - 1);
      likes[docId].users = likes[docId].users.filter(id => id !== userId);
    }
    
    // 更新用户点赞列表
    const index = userLikes.indexOf(docId);
    if (index > -1) {
      userLikes.splice(index, 1);
    }
    
    // 保存
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(likes));
    localStorage.setItem(this.USER_LIKES_KEY, JSON.stringify(userLikes));
    
    // 触发事件
    this.triggerEvent('unlike', { docId, userId, count: likes[docId]?.count || 0 });
    
    return { success: true, count: likes[docId]?.count || 0 };
  },
  
  // 切换点赞状态
  toggle(docId, userId = 'anonymous') {
    if (this.hasUserLiked(docId, userId)) {
      return this.unlike(docId, userId);
    } else {
      return this.like(docId, userId);
    }
  },
  
  // 获取热门文档（按点赞数排序）
  getHotDocs(limit = 10) {
    const likes = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    
    return Object.entries(likes)
      .map(([docId, data]) => ({ docId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
  
  // 获取文档排名
  getDocRank(docId) {
    const hotDocs = this.getHotDocs();
    const index = hotDocs.findIndex(doc => doc.docId === docId);
    return index === -1 ? null : index + 1;
  },
  
  // 事件监听
  listeners: {},
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  
  triggerEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  },
  
  // 导出数据
  exportData() {
    return {
      likes: JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'),
      userLikes: JSON.parse(localStorage.getItem(this.USER_LIKES_KEY) || '[]')
    };
  },
  
  // 导入数据
  importData(data) {
    if (data.likes) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.likes));
    }
    if (data.userLikes) {
      localStorage.setItem(this.USER_LIKES_KEY, JSON.stringify(data.userLikes));
    }
  },
  
  // 清空数据
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.USER_LIKES_KEY);
    this.init();
  }
};

// 初始化
LikeSystem.init();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LikeSystem;
}

// 全局可用
window.LikeSystem = LikeSystem;

// 初始化点赞按钮
function initLikeButtons() {
  document.querySelectorAll('[data-like-doc]').forEach(btn => {
    const docId = btn.dataset.likeDoc;
    const countEl = btn.querySelector('.like-count');
    
    // 更新初始状态
    const likes = LikeSystem.getDocLikes(docId);
    if (countEl) countEl.textContent = likes.count;
    
    if (LikeSystem.hasUserLiked(docId)) {
      btn.classList.add('liked');
      btn.querySelector('i')?.classList.replace('far', 'fas');
    }
    
    // 点击事件
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const result = LikeSystem.toggle(docId);
      
      if (result.success) {
        // 更新 UI
        if (countEl) countEl.textContent = result.count;
        
        if (LikeSystem.hasUserLiked(docId)) {
          btn.classList.add('liked');
          btn.querySelector('i')?.classList.replace('far', 'fas');
          
          // 添加动画
          btn.style.transform = 'scale(1.2)';
          setTimeout(() => btn.style.transform = 'scale(1)', 200);
        } else {
          btn.classList.remove('liked');
          btn.querySelector('i')?.classList.replace('fas', 'far');
        }
      }
    });
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initLikeButtons);

// 监听点赞事件
LikeSystem.on('like', (data) => {
  console.log('点赞成功:', data);
  // 可以在这里添加全局提示
});

LikeSystem.on('unlike', (data) => {
  console.log('取消点赞:', data);
});

// 示例用法：
// LikeSystem.like('doc_001', 'user_001');
// LikeSystem.unlike('doc_001', 'user_001');
// LikeSystem.toggle('doc_001', 'user_001');
// LikeSystem.getHotDocs(5);
