// Firebase 配置
// 注意：这里使用的是 Firebase 配置模板，实际使用时需要替换为你的 Firebase 项目配置

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "openclaw-kb.firebaseapp.com",
  projectId: "openclaw-kb",
  storageBucket: "openclaw-kb.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化 Firebase
// 注意：实际使用时需要取消注释以下代码并引入 Firebase SDK
// firebase.initializeApp(firebaseConfig);

// 导出配置
export { firebaseConfig };

// 模拟用户数据（开发测试用）
const mockUsers = [
  {
    uid: "user_001",
    email: "test@example.com",
    phoneNumber: "+8613800138000",
    displayName: "测试用户",
    photoURL: null,
    emailVerified: true,
    createdAt: "2026-03-10T12:00:00Z",
    lastLoginAt: "2026-03-10T12:00:00Z"
  }
];

// 当前登录用户
let currentUser = null;

// 检查登录状态
function checkAuthState() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForLoggedInUser();
  }
}

// 更新 UI 为登录状态
function updateUIForLoggedInUser() {
  if (!currentUser) return;
  
  // 更新导航栏
  const loginBtn = document.querySelector('[onclick="showLoginModal()"]');
  if (loginBtn) {
    loginBtn.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
          ${currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
        </div>
        <span class="hidden md:inline">${currentUser.displayName || '用户'}</span>
      </div>
    `;
    loginBtn.onclick = showUserMenu;
  }
}

// 显示用户菜单
function showUserMenu() {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  
  // 创建用户菜单
  const menu = document.createElement('div');
  menu.id = 'userMenu';
  menu.className = 'absolute right-4 top-16 w-48 glass rounded-xl shadow-lg py-2 z-50';
  menu.innerHTML = `
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <p class="text-sm font-medium text-gray-800 dark:text-white">${currentUser.displayName || '用户'}</p>
      <p class="text-xs text-gray-500 truncate">${currentUser.email || currentUser.phoneNumber}</p>
    </div>
    <a href="user-center.html" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <i class="fas fa-user mr-2"></i>个人中心
    </a>
    <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <i class="fas fa-file-alt mr-2"></i>我的上传
    </a>
    <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <i class="fas fa-heart mr-2"></i>我的点赞
    </a>
    <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
      <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
        <i class="fas fa-sign-out-alt mr-2"></i>退出登录
      </button>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // 点击外部关闭菜单
  setTimeout(() => {
    document.addEventListener('click', closeUserMenu);
  }, 100);
}

// 关闭用户菜单
function closeUserMenu(e) {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.contains(e.target)) {
    menu.remove();
    document.removeEventListener('click', closeUserMenu);
  }
}

// 登录（模拟）
function login(email, password) {
  return new Promise((resolve, reject) => {
    // 模拟登录延迟
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('用户不存在'));
      }
    }, 1000);
  });
}

// 手机号登录（模拟）
function loginWithPhone(phoneNumber, code) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === '123456') {
        const user = mockUsers.find(u => u.phoneNumber === phoneNumber) || {
          uid: "user_" + Date.now(),
          phoneNumber: phoneNumber,
          displayName: "手机用户",
          email: null,
          photoURL: null,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('验证码错误'));
      }
    }, 1000);
  });
}

// 注册（模拟）
function register(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        reject(new Error('用户已存在'));
      } else {
        const newUser = {
          uid: "user_" + Date.now(),
          email: email,
          phoneNumber: null,
          displayName: email.split('@')[0],
          photoURL: null,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        mockUsers.push(newUser);
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        resolve(newUser);
      }
    }, 1000);
  });
}

// 退出登录
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  // 更新 UI
  const loginBtn = document.querySelector('[onclick="showUserMenu()"]') || 
                   document.querySelector('[onclick="showLoginModal()"]');
  if (loginBtn) {
    loginBtn.innerHTML = '登录';
    loginBtn.onclick = showLoginModal;
  }
  
  // 关闭菜单
  const menu = document.getElementById('userMenu');
  if (menu) menu.remove();
  
  alert('已退出登录');
}

// 检查是否登录
function isLoggedIn() {
  return currentUser !== null;
}

// 获取当前用户
function getCurrentUser() {
  return currentUser;
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', checkAuthState);

// 导出函数
export {
  checkAuthState,
  login,
  loginWithPhone,
  register,
  logout,
  isLoggedIn,
  getCurrentUser,
  updateUIForLoggedInUser
};
