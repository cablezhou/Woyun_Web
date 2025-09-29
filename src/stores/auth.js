/**
 * 认证状态管理
 * 使用Vue3的Composition API实现简单的状态管理
 */
import { ref, computed, watchEffect } from 'vue'
import { getCurrentUser, isLoggedIn as checkLoggedIn } from '../api/auth.js'
import { getFullImageUrl } from '../config/index.js'
import { loadImageWithHeaders } from '../utils/imageLoader.js'

// 全局状态
const isLoggedIn = ref(false)
const currentUser = ref(null)
const authLoading = ref(true)
const processedUserAvatar = ref('')

// 计算属性
const userDisplayName = computed(() => {
  return currentUser.value?.name || currentUser.value?.username || '未知用户'
})

const userAvatar = computed(() => {
  return processedUserAvatar.value || getFullImageUrl(currentUser.value?.avatarUrl)
})

// 处理用户头像的异步函数
const processUserAvatar = async () => {
  if (currentUser.value?.avatarUrl) {
    try {
      const fullAvatarUrl = getFullImageUrl(currentUser.value.avatarUrl)
      const processedAvatar = await loadImageWithHeaders(fullAvatarUrl)
      processedUserAvatar.value = processedAvatar
    } catch (error) {
      console.error('处理用户头像失败:', error)
      processedUserAvatar.value = getFullImageUrl(currentUser.value.avatarUrl)
    }
  } else {
    processedUserAvatar.value = ''
  }
}

const isAdmin = computed(() => {
  return currentUser.value?.role === 'admin'
})

// 初始化认证状态
const initAuthState = async () => {
  try {
    const loggedIn = checkLoggedIn()
    const user = getCurrentUser()
    
    isLoggedIn.value = loggedIn
    currentUser.value = user
    
    // 处理用户头像
    if (user?.avatarUrl) {
      await processUserAvatar()
    }
    
    if (import.meta.env.DEV) {
      console.log('🔐 认证状态初始化:', {
        isLoggedIn: loggedIn,
        user: user
      })
    }
  } catch (error) {
    console.error('认证状态初始化失败:', error)
    isLoggedIn.value = false
    currentUser.value = null
    processedUserAvatar.value = ''
  } finally {
    authLoading.value = false
  }
}

// 更新认证状态
const updateAuthState = async (loginStatus, userInfo = null) => {
  isLoggedIn.value = loginStatus
  currentUser.value = userInfo
  
  // 处理用户头像
  if (userInfo?.avatarUrl) {
    await processUserAvatar()
  } else {
    processedUserAvatar.value = ''
  }
  
  if (import.meta.env.DEV) {
    console.log('🔄 认证状态更新:', {
      isLoggedIn: loginStatus,
      user: userInfo
    })
  }
}

// 清除认证状态
const clearAuthState = () => {
  isLoggedIn.value = false
  currentUser.value = null
  processedUserAvatar.value = ''
  
  if (import.meta.env.DEV) {
    console.log('🧹 认证状态已清除')
  }
}

// 更新用户信息
const updateUserInfo = async (userInfo) => {
  if (currentUser.value) {
    currentUser.value = { ...currentUser.value, ...userInfo }
    
    // 如果更新了头像，重新处理
    if (userInfo.avatarUrl) {
      await processUserAvatar()
    }
    
    // 同步更新localStorage
    try {
      localStorage.setItem('woyun_user', JSON.stringify(currentUser.value))
    } catch (error) {
      console.error('更新本地用户信息失败:', error)
    }
  }
}

// 监听localStorage变化（支持多标签页同步）
const setupStorageSync = () => {
  const handleStorageChange = (e) => {
    if (e.key === 'woyun_token' || e.key === 'woyun_user') {
      // 重新初始化认证状态
      initAuthState()
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

// 认证钩子函数
export const useAuth = () => {
  return {
    // 状态
    isLoggedIn: computed(() => isLoggedIn.value),
    currentUser: computed(() => currentUser.value),
    authLoading: computed(() => authLoading.value),
    
    // 计算属性
    userDisplayName,
    userAvatar,
    isAdmin,
    
    // 方法
    initAuthState,
    updateAuthState,
    clearAuthState,
    updateUserInfo,
    setupStorageSync
  }
}

// 认证状态导航守卫
export const requireAuth = () => {
  if (!isLoggedIn.value) {
    console.warn('⚠️ 访问受保护的资源需要登录')
    return false
  }
  return true
}

// 检查是否有特定权限
export const hasPermission = (permission) => {
  if (!currentUser.value) {
    return false
  }
  
  // 如果是管理员，拥有所有权限
  if (currentUser.value.role === 'admin') {
    return true
  }
  
  // 检查用户权限列表
  const userPermissions = currentUser.value.permissions || []
  return userPermissions.includes(permission)
}

// 初始化（页面加载时调用）
if (typeof window !== 'undefined') {
  initAuthState()
}