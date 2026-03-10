// 热门文章排名算法
// 小龙虾项目 - Phase 4

const HotRanking = {
  // 权重配置
  WEIGHTS: {
    VIEWS: 0.3,      // 阅读量权重 30%
    LIKES: 0.4,      // 点赞权重 40%
    COMMENTS: 0.2,   // 评论权重 20%
    TIME: 0.1        // 时间衰减权重 10%
  },
  
  // 时间衰减参数（天）
  TIME_DECAY_DAYS: 7,
  
  // 计算热度分数
  calculateHotScore(doc) {
    const now = new Date();
    const publishTime = new Date(doc.publishTime || doc.createdAt);
    const daysSincePublish = (now - publishTime) / (1000 * 60 * 60 * 24);
    
    // 时间衰减因子（越新的文章分数越高）
    const timeDecay = Math.exp(-daysSincePublish / this.TIME_DECAY_DAYS);
    
    // 各项得分
    const viewsScore = Math.log10(doc.views + 1) * 10;
    const likesScore = doc.likes * 2;
    const commentsScore = doc.comments * 1.5;
    
    // 综合得分
    const score = (
      viewsScore * this.WEIGHTS.VIEWS +
      likesScore * this.WEIGHTS.LIKES +
      commentsScore * this.WEIGHTS.COMMENTS
    ) * (1 + timeDecay * this.WEIGHTS.TIME);
    
    return {
      ...doc,
      hotScore: Math.round(score * 100) / 100,
      timeDecay: Math.round(timeDecay * 100) / 100,
      rankFactors: {
        views: Math.round(viewsScore * this.WEIGHTS.VIEWS * 100) / 100,
        likes: Math.round(likesScore * this.WEIGHTS.LIKES * 100) / 100,
        comments: Math.round(commentsScore * this.WEIGHTS.COMMENTS * 100) / 100,
        time: Math.round(timeDecay * this.WEIGHTS.TIME * 100) / 100
      }
    };
  },
  
  // 获取热门文章列表
  getHotDocs(docs, limit = 10) {
    // 计算每篇文章的热度分数
    const scoredDocs = docs.map(doc => this.calculateHotScore(doc));
    
    // 按热度分数排序
    return scoredDocs
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, limit)
      .map((doc, index) => ({
        ...doc,
        hotRank: index + 1
      }));
  },
  
  // 获取趋势文章（最近24小时热度上升最快）
  getTrendingDocs(docs, limit = 5) {
    const now = new Date();
    
    return docs
      .filter(doc => {
        const publishTime = new Date(doc.publishTime || doc.createdAt);
        const hoursSincePublish = (now - publishTime) / (1000 * 60 * 60);
        return hoursSincePublish <= 24;
      })
      .map(doc => this.calculateHotScore(doc))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, limit)
      .map((doc, index) => ({
        ...doc,
        trendingRank: index + 1
      }));
  },
  
  // 获取分类热门
  getHotDocsByCategory(docs, category, limit = 5) {
    const categoryDocs = docs.filter(doc => doc.category === category);
    return this.getHotDocs(categoryDocs, limit);
  },
  
  // 更新文章数据
  updateDocStats(docId, type, value = 1) {
    const docs = JSON.parse(localStorage.getItem('lobster_docs') || '[]');
    const docIndex = docs.findIndex(d => d.id === docId);
    
    if (docIndex === -1) return null;
    
    switch (type) {
      case 'view':
        docs[docIndex].views = (docs[docIndex].views || 0) + value;
        break;
      case 'like':
        docs[docIndex].likes = (docs[docIndex].likes || 0) + value;
        break;
      case 'comment':
        docs[docIndex].comments = (docs[docIndex].comments || 0) + value;
        break;
    }
    
    docs[docIndex].lastUpdated = new Date().toISOString();
    localStorage.setItem('lobster_docs', JSON.stringify(docs));
    
    return docs[docIndex];
  },
  
  // 生成热门榜单 HTML
  generateHotBanner(hotDocs) {
    if (!hotDocs || hotDocs.length === 0) return '';
    
    return `
      <div class="swiper hotSwiper">
        <div class="swiper-wrapper">
          ${hotDocs.map(doc => `
            <div class="swiper-slide">
              <div class="glass-card rounded-2xl overflow-hidden h-64 cursor-pointer" onclick="openDoc('${doc.id}')">
                <div class="h-32 ${doc.gradient || 'gradient-hot'} flex items-center justify-center relative">
                  ${doc.hotRank <= 3 ? `
                    <div class="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-lg">
                      ${doc.hotRank === 1 ? '🔥' : doc.hotRank === 2 ? '🥈' : '🥉'}
                    </div>
                  ` : ''}
                  <i class="${doc.icon || 'fas fa-file-alt'} text-6xl text-white/80"></i>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">${doc.title}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">${doc.description}</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-hot font-bold">🔥 ${doc.hotScore} 热度</span>
                    <span class="text-gray-500"><i class="fas fa-eye mr-1"></i>${this.formatNumber(doc.views)}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
    `;
  },
  
  // 生成趋势榜单
  generateTrendingList(trendingDocs) {
    if (!trendingDocs || trendingDocs.length === 0) return '';
    
    return `
      <div class="space-y-3">
        ${trendingDocs.map((doc, index) => `
          <div class="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors" onclick="openDoc('${doc.id}')">
            <div class="w-10 h-10 rounded-lg ${doc.gradient || 'bg-gradient-to-br from-primary to-red-400'} flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold">${index + 1}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-800 dark:text-white truncate">${doc.title}</h4>
              <p class="text-xs text-gray-500">${doc.description}</p>
            </div>
            <div class="text-right">
              <div class="text-hot text-sm font-bold">+${Math.round(doc.hotScore)}</div>
              <div class="text-xs text-gray-500">热度上升</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // 格式化数字
  formatNumber(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  },
  
  // 模拟数据（演示用）
  getMockDocs() {
    return [
      {
        id: 'doc_001',
        title: 'OpenClaw 安装指南',
        description: '详细的安装步骤，支持多平台',
        category: '教程',
        icon: 'fas fa-download',
        gradient: 'bg-gradient-to-br from-primary to-red-400',
        views: 2300,
        likes: 567,
        comments: 89,
        publishTime: '2026-03-10T10:00:00Z'
      },
      {
        id: 'doc_002',
        title: '快速开始',
        description: '30分钟上手 OpenClaw',
        category: '教程',
        icon: 'fas fa-rocket',
        gradient: 'bg-gradient-to-br from-secondary to-blue-400',
        views: 1800,
        likes: 423,
        comments: 56,
        publishTime: '2026-03-10T09:00:00Z'
      },
      {
        id: 'doc_003',
        title: 'Skills 开发指南',
        description: '编写你的第一个 Skill',
        category: 'Skills',
        icon: 'fas fa-code',
        gradient: 'bg-gradient-to-br from-purple-500 to-pink-400',
        views: 1500,
        likes: 389,
        comments: 67,
        publishTime: '2026-03-09T15:00:00Z'
      },
      {
        id: 'doc_004',
        title: '提示词工程',
        description: '掌握 Prompt 技巧',
        category: '最佳实践',
        icon: 'fas fa-brain',
        gradient: 'bg-gradient-to-br from-accent to-orange-400',
        views: 1200,
        likes: 298,
        comments: 45,
        publishTime: '2026-03-09T10:00:00Z'
      },
      {
        id: 'doc_005',
        title: '定时任务配置',
        description: '自动化工作流',
        category: 'Skills',
        icon: 'fas fa-clock',
        gradient: 'bg-gradient-to-br from-indigo-500 to-purple-400',
        views: 980,
        likes: 245,
        comments: 34,
        publishTime: '2026-03-08T14:00:00Z'
      },
      {
        id: 'doc_006',
        title: 'Token 优化',
        description: '降低成本提升速度',
        category: '最佳实践',
        icon: 'fas fa-coins',
        gradient: 'bg-gradient-to-br from-pink-500 to-rose-400',
        views: 856,
        likes: 198,
        comments: 28,
        publishTime: '2026-03-08T09:00:00Z'
      }
    ];
  },
  
  // 初始化热门榜单
  initHotBanner() {
    const docs = this.getMockDocs();
    const hotDocs = this.getHotDocs(docs, 6);
    
    const bannerContainer = document.getElementById('hotBanner');
    if (bannerContainer) {
      bannerContainer.innerHTML = this.generateHotBanner(hotDocs);
      
      // 初始化 Swiper
      new Swiper('.hotSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        },
      });
    }
    
    // 初始化趋势列表
    const trendingDocs = this.getTrendingDocs(docs, 5);
    const trendingContainer = document.getElementById('trendingList');
    if (trendingContainer) {
      trendingContainer.innerHTML = this.generateTrendingList(trendingDocs);
    }
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotRanking;
}

// 全局可用
window.HotRanking = HotRanking;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  HotRanking.initHotBanner();
});

// 示例用法：
// const docs = HotRanking.getMockDocs();
// const hotDocs = HotRanking.getHotDocs(docs, 10);
// const trendingDocs = HotRanking.getTrendingDocs(docs, 5);
