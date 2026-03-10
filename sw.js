// Service Worker
// 小龙虾项目 - PWA 支持

const CACHE_NAME = 'openclaw-kb-v1';
const STATIC_ASSETS = [
  '/openclaw-kb/',
  '/openclaw-kb/index.html',
  '/openclaw-kb/user-center.html',
  '/openclaw-kb/doc-viewer.html',
  '/openclaw-kb/manifest.json',
  '/openclaw-kb/assets/lobster-logo.svg',
  '/openclaw-kb/js/firebase-config.js',
  '/openclaw-kb/js/like-system.js',
  '/openclaw-kb/js/read-stats.js',
  '/openclaw-kb/js/hot-ranking.js',
  '/openclaw-kb/js/search.js',
  '/openclaw-kb/js/comment-system.js'
];

// CDN 资源缓存
const CDN_CACHE_NAME = 'openclaw-cdn-v1';
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://vjs.zencdn.net/8.6.1/video-js.css',
  'https://vjs.zencdn.net/8.6.1/video.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// 安装 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(CDN_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching CDN assets');
        return cache.addAll(CDN_ASSETS);
      })
    ])
    .then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
    .catch((err) => {
      console.error('[SW] Installation failed:', err);
    })
  );
});

// 激活 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== CDN_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') return;
  
  // 跳过 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') return;
  
  // 跳过 Supabase/Firebase API 请求
  if (url.hostname.includes('supabase') || url.hostname.includes('firebase')) {
    return;
  }
  
  // 策略：缓存优先，网络回退
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // 返回缓存，同时后台更新
        fetchAndCache(request);
        return cachedResponse;
      }
      
      // 缓存未命中，从网络获取
      return fetchAndCache(request);
    })
    .catch(() => {
      // 网络失败，返回离线页面
      if (request.mode === 'navigate') {
        return caches.match('/openclaw-kb/offline.html');
      }
      
      // 返回默认响应
      return new Response('离线模式 - 内容不可用', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

// 获取并缓存
async function fetchAndCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (!networkResponse || networkResponse.status !== 200) {
      return networkResponse;
    }
    
    // 克隆响应（因为响应流只能读取一次）
    const responseToCache = networkResponse.clone();
    
    // 确定缓存名称
    const url = new URL(request.url);
    const cacheName = CDN_ASSETS.includes(request.url) ? CDN_CACHE_NAME : CACHE_NAME;
    
    caches.open(cacheName).then((cache) => {
      cache.put(request, responseToCache);
    });
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// 后台同步（用于离线评论）
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  }
});

// 同步评论
async function syncComments() {
  const db = await openDB('lobster-offline', 1);
  const comments = await db.getAll('pendingComments');
  
  for (const comment of comments) {
    try {
      // 发送到服务器
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      
      // 删除已同步的评论
      await db.delete('pendingComments', comment.id);
    } catch (error) {
      console.error('[SW] Failed to sync comment:', error);
    }
  }
}

// 推送通知
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/openclaw-kb/assets/icons/icon-192x192.png',
    badge: '/openclaw-kb/assets/icons/badge-72x72.png',
    tag: data.tag,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: '查看'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/openclaw-kb/')
    );
  }
});

// 消息处理（来自主线程）
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
