// 搜索功能
// 小龙虾项目 - Phase 4

const SearchEngine = {
  // 搜索配置
  config: {
    minQueryLength: 2,
    maxResults: 20,
    highlightMatches: true,
    fuzzyMatch: true,
    searchInContent: true
  },
  
  // 文档索引
  docIndex: [],
  
  // 初始化搜索
  init() {
    this.buildIndex();
    this.initSearchUI();
  },
  
  // 构建搜索索引
  buildIndex() {
    const docs = JSON.parse(localStorage.getItem('lobster_docs') || '[]');
    
    this.docIndex = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      content: doc.content || '',
      category: doc.category,
      tags: doc.tags || [],
      author: doc.author,
      publishTime: doc.publishTime,
      // 预处理：分词和标准化
      tokens: this.tokenize(`${doc.title} ${doc.description} ${doc.content} ${doc.tags.join(' ')}`)
    }));
  },
  
  // 分词处理
  tokenize(text) {
    if (!text) return [];
    
    // 移除特殊字符，转换为小写
    const cleanText = text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // 中文分词（简单实现）
    const tokens = [];
    let currentWord = '';
    
    for (const char of cleanText) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // 中文字符
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
        tokens.push(char);
      } else if (/\s/.test(char)) {
        // 空格
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
      } else {
        // 英文/数字
        currentWord += char;
      }
    }
    
    if (currentWord) {
      tokens.push(currentWord);
    }
    
    return tokens;
  },
  
  // 搜索
  search(query, options = {}) {
    const opts = { ...this.config, ...options };
    
    if (!query || query.length < opts.minQueryLength) {
      return [];
    }
    
    const queryTokens = this.tokenize(query);
    const results = [];
    
    for (const doc of this.docIndex) {
      const score = this.calculateRelevance(doc, queryTokens, query);
      
      if (score > 0) {
        results.push({
          ...doc,
          relevanceScore: score,
          highlighted: opts.highlightMatches ? this.highlightMatches(doc, query) : null
        });
      }
    }
    
    // 按相关度排序
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, opts.maxResults);
  },
  
  // 计算相关度分数
  calculateRelevance(doc, queryTokens, originalQuery) {
    let score = 0;
    const queryLower = originalQuery.toLowerCase();
    
    // 标题匹配（权重最高）
    if (doc.title.toLowerCase().includes(queryLower)) {
      score += 10;
      if (doc.title.toLowerCase().startsWith(queryLower)) {
        score += 5;
      }
    }
    
    // 描述匹配
    if (doc.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // 标签匹配
    if (doc.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 8;
    }
    
    // 分词匹配
    let tokenMatches = 0;
    for (const token of queryTokens) {
      if (doc.tokens.includes(token)) {
        tokenMatches++;
      }
    }
    score += (tokenMatches / queryTokens.length) * 3;
    
    // 内容匹配
    if (this.config.searchInContent && doc.content) {
      const contentMatches = doc.content.toLowerCase().split(queryLower).length - 1;
      score += Math.min(contentMatches * 0.5, 5);
    }
    
    // 模糊匹配
    if (this.config.fuzzyMatch) {
      for (const token of queryTokens) {
        for (const docToken of doc.tokens) {
          if (this.levenshteinDistance(token, docToken) <= 1) {
            score += 1;
          }
        }
      }
    }
    
    return score;
  },
  
  // Levenshtein 距离（模糊匹配）
  levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  },
  
  // 高亮匹配文本
  highlightMatches(doc, query) {
    const queryLower = query.toLowerCase();
    const regex = new RegExp(`(${query})`, 'gi');
    
    return {
      title: doc.title.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>'),
      description: doc.description.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>'),
      content: doc.content ? doc.content.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>') : ''
    };
  },
  
  // 搜索建议
  getSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set();
    const queryLower = query.toLowerCase();
    
    for (const doc of this.docIndex) {
      // 标题建议
      if (doc.title.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.title);
      }
      
      // 标签建议
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      }
    }
    
    return Array.from(suggestions).slice(0, limit);
  },
  
  // 热门搜索
  getHotSearches(limit = 5) {
    const searches = JSON.parse(localStorage.getItem('lobster_search_history') || '[]');
    const frequency = {};
    
    for (const search of searches) {
      frequency[search.query] = (frequency[search.query] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  },
  
  // 保存搜索历史
  saveSearchHistory(query) {
    if (!query) return;
    
    const searches = JSON.parse(localStorage.getItem('lobster_search_history') || '[]');
    searches.unshift({
      query,
      timestamp: new Date().toISOString()
    });
    
    // 限制历史记录数量
    if (searches.length > 50) {
      searches.pop();
    }
    
    localStorage.setItem('lobster_search_history', JSON.stringify(searches));
  },
  
  // 获取搜索历史
  getSearchHistory(limit = 10) {
    const searches = JSON.parse(localStorage.getItem('lobster_search_history') || '[]');
    return searches.slice(0, limit);
  },
  
  // 清除搜索历史
  clearSearchHistory() {
    localStorage.removeItem('lobster_search_history');
  },
  
  // 初始化搜索 UI
  initSearchUI() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    // 输入防抖
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
          // 显示建议
          const suggestions = this.getSuggestions(query);
          this.renderSuggestions(suggestions, searchSuggestions);
          
          // 实时搜索
          const results = this.search(query);
          this.renderResults(results, searchResults);
        } else {
          this.renderSuggestions([], searchSuggestions);
          this.renderResults([], searchResults);
        }
      }, 300);
    });
    
    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          this.saveSearchHistory(query);
          const results = this.search(query);
          this.renderResults(results, searchResults);
        }
      }
    });
  },
  
  // 渲染搜索建议
  renderSuggestions(suggestions, container) {
    if (!container) return;
    
    if (suggestions.length === 0) {
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }
    
    container.innerHTML = `
      <div class="glass rounded-xl p-2">
        ${suggestions.map(s => `
          <div class="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors" 
               onclick="SearchEngine.selectSuggestion('${s}')">
            <i class="fas fa-search text-gray-400 mr-2"></i>${s}
          </div>
        `).join('')}
      </div>
    `;
    container.classList.remove('hidden');
  },
  
  // 渲染搜索结果
  renderResults(results, container) {
    if (!container) return;
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-search text-4xl mb-4"></i>
          <p>没有找到相关结果</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="space-y-4">
        ${results.map(result => `
          <div class="glass rounded-xl p-4 cursor-pointer hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors" 
               onclick="openDoc('${result.id}')">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-red-400 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-file-alt text-white"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-800 dark:text-white mb-1">
                  ${result.highlighted ? result.highlighted.title : result.title}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  ${result.highlighted ? result.highlighted.description : result.description}
                </p>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span><i class="fas fa-folder mr-1"></i>${result.category}</span>
                  <span><i class="fas fa-eye mr-1"></i>${result.views || 0}</span>
                  <span class="text-primary">相关度: ${Math.round(result.relevanceScore * 10) / 10}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  // 选择建议
  selectSuggestion(suggestion) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = suggestion;
      this.saveSearchHistory(suggestion);
      const results = this.search(suggestion);
      this.renderResults(results, document.getElementById('searchResults'));
    }
    document.getElementById('searchSuggestions')?.classList.add('hidden');
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}

// 全局可用
window.SearchEngine = SearchEngine;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  SearchEngine.init();
});

// 示例用法：
// SearchEngine.search('安装');
// SearchEngine.getSuggestions('安装');
// SearchEngine.getHotSearches();
