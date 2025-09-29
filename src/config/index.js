/**
 * 应用配置管理
 */

// 高德地图配置
export const AMAP_CONFIG = {
  // JS API密钥（用于交互式地图）
  key: import.meta.env.VITE_AMAP_KEY || 'your-amap-api-key',
  // Web服务API密钥（用于静态地图、地理编码等）
  webKey: import.meta.env.VITE_AMAP_WEB_KEY || import.meta.env.VITE_AMAP_KEY || 'your-amap-web-key',
  // API安全码
  secret: import.meta.env.VITE_AMAP_SECRET || '',
  // 地图版本
  version: '1.4.15',
  // 插件列表
  plugins: [
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.Geolocation',
    'AMap.Geocoder',
    'AMap.Driving',
    'AMap.Riding'
  ]
}

console.log('🗺️ 高德地图配置:', AMAP_CONFIG)

// API配置
export const API_CONFIG = {
  // 开发环境使用相对路径，交给Vite代理处理
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://asking-delivery-newspapers-firms.trycloudflare.com'),
  timeout: 10000,
  // 请求重试配置
  retry: {
    times: 3,
    delay: 1000
  }
}

// 统一的图片URL处理函数
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return '/imagines/members/avatar/member1.jpg' // 默认头像
  }
  
  // 如果已经是完整URL，直接返回
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // 获取当前的API基地址
  const baseURL = import.meta.env.DEV ? 
    'https://asking-delivery-newspapers-firms.trycloudflare.com' : 
    (import.meta.env.VITE_API_BASE_URL || 'https://asking-delivery-newspapers-firms.trycloudflare.com')
  
  // 处理相对路径
  if (imageUrl.startsWith('/')) {
    return `${baseURL}${imageUrl}`
  }
  
  // 其他情况也加上基础URL
  return `${baseURL}/${imageUrl}`
}

// 批量处理图片URL数组
export const processImageUrls = (imageUrls) => {
  if (!Array.isArray(imageUrls)) {
    return []
  }
  
  return imageUrls.map(url => getFullImageUrl(url))
}

// 应用配置
export const APP_CONFIG = {
  title: import.meta.env.VITE_APP_TITLE || '卧云车队',
  version: '1.0.0'
}

// 检查配置是否完整
export const checkConfig = () => {
  const warnings = []
  
  if (!AMAP_CONFIG.key || AMAP_CONFIG.key === 'your-amap-api-key') {
    warnings.push('高德地图JS API密钥未配置或使用默认值')
  }
  
  if (!AMAP_CONFIG.webKey || AMAP_CONFIG.webKey === 'your-amap-web-key') {
    warnings.push('高德地图Web服务API密钥未配置或使用默认值（需要用于静态地图生成）')
  }
  
  if (warnings.length > 0) {
    console.warn('配置警告:', warnings)
    console.info('请在 .env.local 文件中正确配置 VITE_AMAP_KEY 和 VITE_AMAP_WEB_KEY')
  }
  
  return warnings.length === 0
}