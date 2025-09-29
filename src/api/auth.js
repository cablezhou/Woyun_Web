/**
 * 认证相关API接口
 */
import { http } from './axios.js'

/**
 * 用户注册
 * @param {Object} userData - 用户注册数据
 * @param {string} userData.username - 用户名
 * @param {string} userData.email - 邮箱
 * @param {string} userData.password - 密码
 * @returns {Promise<Object>} 返回token和用户信息
 */
export const register = async (userData) => {
  try {
    const response = await http.post('/api/auth/register', userData)
    
    // 保存token和用户信息到localStorage
    if (response.token) {
      localStorage.setItem('woyun_token', response.token)
      localStorage.setItem('woyun_user', JSON.stringify(response.user))
    }
    
    return response
  } catch (error) {
    console.error('注册失败:', error.message)
    throw error
  }
}

/**
 * 用户登录
 * @param {Object} credentials - 登录凭据
 * @param {string} credentials.username - 用户名
 * @param {string} credentials.password - 密码
 * @returns {Promise<Object>} 返回token和用户信息
 */
export const login = async (credentials) => {
  try {
    const response = await http.post('/api/auth/login', credentials)
    
    console.log('🔑 登录API响应:', response)
    
    // 保存token和用户信息到localStorage
    if (response.token) {
      console.log('💾 保存token:', response.token.substring(0, 20) + '...')
      localStorage.setItem('woyun_token', response.token)
      localStorage.setItem('woyun_user', JSON.stringify(response.user))
      
      // 验证保存结果
      const savedToken = localStorage.getItem('woyun_token')
      const savedUser = localStorage.getItem('woyun_user')
      console.log('💾 保存验证:', {
        tokenSaved: !!savedToken,
        userSaved: !!savedUser,
        tokenMatch: savedToken === response.token
      })
    } else {
      console.error('❌ 登录响应中未找到token')
    }
    
    return response
  } catch (error) {
    console.error('登录失败:', error.message)
    throw error
  }
}

/**
 * 用户登出
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await http.post('/api/auth/logout')
  } catch (error) {
    console.error('登出请求失败:', error.message)
    // 即使请求失败也要清除本地数据
  } finally {
    // 清除本地存储的认证信息
    localStorage.removeItem('woyun_token')
    localStorage.removeItem('woyun_user')
  }
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  const token = localStorage.getItem('woyun_token')
  const user = localStorage.getItem('woyun_user')
  return !!(token && user)
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('woyun_user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('解析用户信息失败:', error)
    return null
  }
}

/**
 * 获取当前token
 * @returns {string|null} token或null
 */
export const getToken = () => {
  return localStorage.getItem('woyun_token')
}

/**
 * 更新本地存储的用户信息
 * @param {Object} userInfo - 新的用户信息
 */
export const updateLocalUserInfo = (userInfo) => {
  try {
    localStorage.setItem('woyun_user', JSON.stringify(userInfo))
  } catch (error) {
    console.error('更新本地用户信息失败:', error)
  }
}

/**
 * 调试函数：检查当前认证状态
 * 可以在浏览器控制台中调用 window.checkAuthDebug()
 */
export const checkAuthDebug = () => {
  const token = localStorage.getItem('woyun_token')
  const user = localStorage.getItem('woyun_user')
  const authInfo = {
    hasToken: !!token,
    hasUser: !!user,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 50)}...` : 'NO_TOKEN',
    userInfo: user ? JSON.parse(user) : null,
    isLoggedIn: isLoggedIn()
  }
  
  console.table(authInfo)
  return authInfo
}

// 将调试函数挂载到全局window对象
if (typeof window !== 'undefined') {
  window.checkAuthDebug = checkAuthDebug
}