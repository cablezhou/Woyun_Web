/**
 * Axios HTTP客户端配置
 */
import axios from 'axios'
import { API_CONFIG } from '../config/index.js'

// 创建axios实例
const httpClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  // 不设置默认的Content-Type，让每个请求自己决定
  // 添加ngrok特定的头部以避免OpaqueResponseBlocking
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})

// 请求拦截器 - 自动添加token
httpClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('woyun_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 检查是否是文件上传请求（FormData）
    const isFileUpload = config.data instanceof FormData
    
    if (isFileUpload) {
      // 文件上传时删除Content-Type，让浏览器自动设置
      delete config.headers['Content-Type']
      delete config.headers['content-type']
      
      if (import.meta.env.DEV) {
        console.log('📤 文件上传请求拦截器处理:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          hasFormData: config.data instanceof FormData,
          headers: config.headers,
          formDataKeys: Array.from(config.data.keys())
        })
      }
    } else {
      // 非文件上传请求，设置默认Content-Type
      if (!config.headers['Content-Type'] && !config.headers['content-type']) {
        config.headers['Content-Type'] = 'application/json'
      }
    }
    
    // 打印请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log('🚀 API请求:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        isFileUpload,
        data: isFileUpload ? '[FormData]' : config.data,
        token: token ? `${token.substring(0, 20)}...` : 'NO_TOKEN'
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ 请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和错误
httpClient.interceptors.response.use(
  (response) => {
    // 打印响应日志（开发环境）
    if (import.meta.env.DEV) {
      console.log('✅ API响应:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    
    // 检查业务状态码
    const { code, message, data } = response.data
    if (code === 200) {
      return data // 直接返回data部分
    } else {
      // 业务错误
      const error = new Error(message || '请求失败')
      error.code = code
      throw error
    }
  },
  async (error) => {
    // 打印错误日志
    console.error('❌ API错误:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    })
    
    // 处理HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录
          localStorage.removeItem('woyun_token')
          localStorage.removeItem('woyun_user')
          window.location.href = '/community'
          throw new Error('登录已过期，请重新登录')
          
        case 403:
          throw new Error('没有权限访问该资源')
          
        case 404:
          throw new Error('请求的资源不存在')
          
        case 500:
          throw new Error('服务器内部错误')
          
        default:
          throw new Error(data?.message || '网络请求失败')
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('请求超时，请检查网络连接')
    } else if (error.message === 'Network Error') {
      // CORS错误的特殊处理
      throw new Error('CORS跨域错误，请重启开发服务器或检查后端CORS配置')
    } else {
      throw new Error('网络连接失败，请检查网络设置')
    }
  }
)

// 请求重试逻辑
const retryRequest = async (originalRequest, retryCount = 0) => {
  if (retryCount >= API_CONFIG.retry.times) {
    throw new Error('请求重试次数已达上限')
  }
  
  await new Promise(resolve => setTimeout(resolve, API_CONFIG.retry.delay))
  
  try {
    return await httpClient(originalRequest)
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
      return retryRequest(originalRequest, retryCount + 1)
    }
    throw error
  }
}

// 封装常用的HTTP方法
export const http = {
  get: (url, config = {}) => httpClient.get(url, config),
  post: (url, data = {}, config = {}) => httpClient.post(url, data, config),
  put: (url, data = {}, config = {}) => httpClient.put(url, data, config),
  delete: (url, config = {}) => httpClient.delete(url, config),
  
  // 文件上传
  upload: (url, formData, config = {}) => {
    const token = localStorage.getItem('woyun_token')
    
    // 打印调试信息
    if (import.meta.env.DEV) {
      console.log('📋 文件上传调试:', {
        url,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO_TOKEN',
        formDataKeys: Array.from(formData.keys()),
        configHeaders: config.headers
      })
      
      // 验证FormData中的文件
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`📄 FormData文件 [${key}]:`, {
            name: value.name,
            type: value.type,
            size: value.size,
            constructor: value.constructor.name
          })
        } else {
          console.log(`📝 FormData数据 [${key}]:`, typeof value === 'string' ? value.substring(0, 100) : value)
        }
      }
    }
    
    // 构建请求配置，明确删除Content-Type
    const uploadConfig = {
      ...config,
      headers: {
        // 只保留Authorization头
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        // 不包含任何Content-Type设置，让浏览器自动处理
        ...Object.fromEntries(
          Object.entries(config.headers || {}).filter(
            ([key]) => key.toLowerCase() !== 'content-type'
          )
        )
      }
    }
    
    // 打印最终的请求配置
    if (import.meta.env.DEV) {
      console.log('🚀 最终上传配置:', {
        url,
        headers: uploadConfig.headers,
        hasContentType: 'content-type' in (uploadConfig.headers || {})
      })
    }
    
    return httpClient.post(url, formData, uploadConfig)
  }
}

export default httpClient