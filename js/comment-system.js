// 评论系统
// 小龙虾项目 - Phase 5

const CommentSystem = {
  // 存储键名
  STORAGE_KEY: 'lobster_comments',
  
  // 初始化
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
    }
  },
  
  // 添加评论
  addComment(docId, content, parentId = null, userId = 'anonymous', userName = '匿名用户') {
    const comments = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    
    if (!comments[docId]) {
      comments[docId] = [];
    }
    
    const comment = {
      id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      docId,
      content,
      parentId,
      userId,
      userName,
      avatar: this.generateAvatar(userName),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };
    
    comments[docId].push(comment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
    
    // 更新文档评论数
    this.updateDocCommentCount(docId, 1);
    
    return comment;
  },
  
  // 删除评论
  deleteComment(docId, commentId, userId) {
    const comments = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    
    if (!comments[docId]) return false;
    
    const commentIndex = comments[docId].findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;
    
    // 检查权限（只能删除自己的评论）
    if (comments[docId][commentIndex].userId !== userId) return false;
    
    // 删除评论及其回复
    const deleteCount = this.countCommentsAndReplies(comments[docId], commentId);
    comments[docId].splice(commentIndex, 1);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
    
    // 更新文档评论数
    this.updateDocCommentCount(docId, -deleteCount);
    
    return true;
  },
  
  // 点赞评论
  likeComment(docId, commentId, userId) {
    const comments = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    
    if (!comments[docId]) return null;
    
    const comment = comments[docId].find(c => c.id === commentId);
    if (!comment) return null;
    
    if (comment.likedBy.includes(userId)) {
      // 取消点赞
      comment.likes--;
      comment.likedBy = comment.likedBy.filter(id => id !== userId);
    } else {
      // 点赞
      comment.likes++;
      comment.likedBy.push(userId);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
    
    return { likes: comment.likes, liked: comment.likedBy.includes(userId) };
  },
  
  // 获取文档评论
  getComments(docId, sortBy = 'newest') {
    const comments = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const docComments = comments[docId] || [];
    
    // 构建评论树
    const commentTree = this.buildCommentTree(docComments);
    
    // 排序
    switch (sortBy) {
      case 'newest':
        commentTree.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        commentTree.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'popular':
        commentTree.sort((a, b) => b.likes - a.likes);
        break;
    }
    
    return commentTree;
  },
  
  // 构建评论树
  buildCommentTree(comments) {
    const commentMap = {};
    const rootComments = [];
    
    // 创建映射
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    
    // 构建树结构
    comments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });
    
    // 对回复按时间排序
    Object.values(commentMap).forEach(comment => {
      comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
    
    return rootComments;
  },
  
  // 统计评论和回复数量
  countCommentsAndReplies(comments, parentId = null) {
    let count = 0;
    
    comments.forEach(comment => {
      if (parentId === null || comment.parentId === parentId) {
        count++;
        count += this.countReplies(comments, comment.id);
      }
    });
    
    return count;
  },
  
  countReplies(comments, parentId) {
    let count = 0;
    
    comments.forEach(comment => {
      if (comment.parentId === parentId) {
        count++;
        count += this.countReplies(comments, comment.id);
      }
    });
    
    return count;
  },
  
  // 更新文档评论数
  updateDocCommentCount(docId, delta) {
    const docs = JSON.parse(localStorage.getItem('lobster_docs') || '[]');
    const docIndex = docs.findIndex(d => d.id === docId);
    
    if (docIndex !== -1) {
      docs[docIndex].comments = (docs[docIndex].comments || 0) + delta;
      localStorage.setItem('lobster_docs', JSON.stringify(docs));
    }
  },
  
  // 生成头像
  generateAvatar(name) {
    const colors = [
      'from-red-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-teal-400',
      'from-yellow-400 to-orange-400',
      'from-purple-400 to-pink-400',
      'from-indigo-400 to-purple-400'
    ];
    const color = colors[name.charCodeAt(0) % colors.length];
    const initial = name.charAt(0).toUpperCase();
    
    return { color, initial };
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
  
  // 渲染评论列表
  renderComments(docId, containerId, sortBy = 'newest') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const comments = this.getComments(docId, sortBy);
    const totalCount = this.countCommentsAndReplies(
      JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}')[docId] || []
    );
    
    // 更新评论数显示
    const countEl = document.getElementById('commentCount');
    if (countEl) countEl.textContent = totalCount;
    
    if (comments.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-comments text-4xl mb-4 opacity-50"></i>
          <p>暂无评论，来发表第一条评论吧！</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = comments.map(comment => this.renderCommentItem(comment)).join('');
  },
  
  // 渲染单个评论
  renderCommentItem(comment, isReply = false) {
    const hasReplies = comment.replies && comment.replies.length > 0;
    
    return `
      <div class="comment-item ${isReply ? 'ml-12 mt-4' : 'mb-6'}" data-comment-id="${comment.id}">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br ${comment.avatar.color} flex items-center justify-center text-white font-bold flex-shrink-0">
            ${comment.avatar.initial}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-gray-800 dark:text-white">${comment.userName}</span>
              <span class="text-xs text-gray-500">${this.formatTime(comment.createdAt)}</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-3">${this.escapeHtml(comment.content)}</p>
            <div class="flex items-center gap-4 text-sm">
              <button onclick="CommentSystem.handleLike('${comment.docId}', '${comment.id}')" 
                      class="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors ${comment.likedBy.includes('anonymous') ? 'text-primary' : ''}">
                <i class="${comment.likedBy.includes('anonymous') ? 'fas' : 'far'} fa-thumbs-up"></i>
                <span>${comment.likes || '赞'}</span>
              </button>
              <button onclick="CommentSystem.showReplyForm('${comment.id}')" 
                      class="text-gray-500 hover:text-primary transition-colors">
                回复
              </button>
              ${comment.userId === 'anonymous' ? `
                <button onclick="CommentSystem.handleDelete('${comment.docId}', '${comment.id}')" 
                        class="text-gray-500 hover:text-red-500 transition-colors">
                  删除
                </button>
              ` : ''}
            </div>
            
            <!-- 回复表单 -->
            <div id="replyForm-${comment.id}" class="hidden mt-4">
              <div class="flex gap-3">
                <textarea id="replyInput-${comment.id}" rows="2" 
                          class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:border-primary resize-none text-sm"
                          placeholder="回复 ${comment.userName}..."></textarea>
                <button onclick="CommentSystem.handleReply('${comment.docId}', '${comment.id}')" 
                        class="px-4 py-2 rounded-lg gradient-hot text-white text-sm hover:opacity-90 transition-opacity">
                  发送
                </button>
              </div>
            </div>
            
            <!-- 回复列表 -->
            ${hasReplies ? `
              <div class="mt-4">
                ${comment.replies.map(reply => this.renderCommentItem(reply, true)).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },
  
  // 处理点赞
  handleLike(docId, commentId) {
    const result = this.likeComment(docId, commentId, 'anonymous');
    if (result) {
      this.renderComments(docId, 'commentsList');
    }
  },
  
  // 显示回复表单
  showReplyForm(commentId) {
    const form = document.getElementById(`replyForm-${commentId}`);
    if (form) {
      form.classList.toggle('hidden');
      if (!form.classList.contains('hidden')) {
        document.getElementById(`replyInput-${commentId}`).focus();
      }
    }
  },
  
  // 处理回复
  handleReply(docId, parentId) {
    const input = document.getElementById(`replyInput-${parentId}`);
    const content = input.value.trim();
    
    if (!content) return;
    
    this.addComment(docId, content, parentId, 'anonymous', '匿名用户');
    input.value = '';
    
    this.renderComments(docId, 'commentsList');
  },
  
  // 处理删除
  handleDelete(docId, commentId) {
    if (confirm('确定要删除这条评论吗？')) {
      this.deleteComment(docId, commentId, 'anonymous');
      this.renderComments(docId, 'commentsList');
    }
  },
  
  // 处理主评论提交
  handleSubmit(docId) {
    const input = document.getElementById('mainCommentInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    this.addComment(docId, content, null, 'anonymous', '匿名用户');
    input.value = '';
    
    this.renderComments(docId, 'commentsList');
  },
  
  // HTML转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // 导出数据
  exportData() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
  },
  
  // 导入数据
  importData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 清空数据
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.init();
  }
};

// 初始化
CommentSystem.init();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommentSystem;
}

// 全局可用
window.CommentSystem = CommentSystem;

// 示例用法：
// CommentSystem.addComment('doc_001', '很有帮助！', null, 'user_001', '张三');
// CommentSystem.getComments('doc_001');
// CommentSystem.renderComments('doc_001', 'commentsList');
