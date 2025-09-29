/**
 * 高德地图工具类
 * 提供地图初始化、路线绘制等功能
 */
import { AMAP_CONFIG } from '../config/index.js'

// 缩略图缓存
const thumbnailCache = new Map()

// 加载高德地图API脚本
export const loadAmapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=${AMAP_CONFIG.version}&key=${AMAP_CONFIG.key}&callback=initAMap`
    script.onerror = reject
    
    window.initAMap = () => {
      resolve()
    }
    
    document.head.appendChild(script)
  })
}

// 创建地图实例
export const createMap = (container, options = {}) => {
  const defaultOptions = {
    zoom: 13,
    mapStyle: 'amap://styles/normal',
    viewMode: '2D'
  }
  
  return new AMap.Map(container, { ...defaultOptions, ...options })
}

// 绘制路线
export const drawRoute = (map, points, options = {}) => {
  if (!map || !points || points.length === 0) return null

  const defaultOptions = {
    strokeColor: '#667eea',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    strokeStyle: 'solid'
  }

  // 创建路线折线
  const routeLine = new AMap.Polyline({
    path: points,
    ...defaultOptions,
    ...options
  })

  map.add(routeLine)

  // 添加起点和终点标记
  if (options.showMarkers !== false) {
    const startMarker = new AMap.Marker({
      position: points[0],
      icon: new AMap.Icon({
        size: new AMap.Size(25, 34),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png'
      })
    })

    const endMarker = new AMap.Marker({
      position: points[points.length - 1],
      icon: new AMap.Icon({
        size: new AMap.Size(25, 34),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png'
      })
    })

    map.add([startMarker, endMarker])
  }

  return routeLine
}

// 生成路线缩略图（带缓存）
export const generateRouteThumbnail = async (points, width = 300, height = 200, routeId = null) => {
  console.log('🎨 开始生成路线缩略图:', { points, width, height, routeId })
  
  if (!points || points.length === 0) {
    console.warn('⚠️ 点位数据为空，使用默认缩略图')
    return '/imagines/Background2.jpg'
  }

  // 检查缓存
  const cacheKey = routeId ? `route_${routeId}_${width}x${height}` : `points_${JSON.stringify(points)}_${width}x${height}`
  if (thumbnailCache.has(cacheKey)) {
    console.log('💾 使用缓存的缩略图:', cacheKey)
    return thumbnailCache.get(cacheKey)
  }

  try {
    console.log('🚀 开始生成缩略图...')
    
    // 确保高德地图API已加载
    await loadAmapScript()
    
    // 使用高德静态地图API生成缩略图
    const staticImageUrl = await generateStaticMapUrl({
      points: points,
      width: width,
      height: height
    })

    // 缓存结果
    thumbnailCache.set(cacheKey, staticImageUrl)
    
    console.log('✅ 路线缩略图生成成功:', staticImageUrl)
    return staticImageUrl
  } catch (error) {
    console.error('❌ 生成路线缩略图失败:', error)
    const fallbackUrl = '/imagines/Background2.jpg'
    thumbnailCache.set(cacheKey, fallbackUrl) // 缓存失败结果避免重复尝试
    return fallbackUrl
  }
}

// 生成高德静态地图URL
const generateStaticMapUrl = async (options) => {
  const { points, width, height } = options
  
  console.log('🗺️ 生成静态地图URL，参数:', { points, width, height })
  
  // 计算路线边界
  const bounds = calculateBounds(points)
  const center = {
    lng: (bounds.northeast.lng + bounds.southwest.lng) / 2,
    lat: (bounds.northeast.lat + bounds.southwest.lat) / 2
  }
  
  console.log('📍 路线中心点:', center)
  console.log('📐 路线边界:', bounds)
  
  // 计算适合的缩放级别
  const zoom = calculateZoomLevel(bounds, width, height)
  console.log('🔍 计算缩放级别:', zoom)
  
  const baseUrl = 'https://restapi.amap.com/v3/staticmap'
  const params = new URLSearchParams({
    key: AMAP_CONFIG.webKey, // 使用Web服务API密钥
    center: `${center.lng},${center.lat}`,
    zoom: zoom,
    size: `${width}*${height}`,
    scale: 2, // 高分辨率
    format: 'jpg',
    maptype: 'normal'
  })
  
  console.log('🔑 高德API密钥:', AMAP_CONFIG.webKey)
  
  // 添加路线路径
  const pathString = encodePathForStaticMap(points)
  console.log('🛣️ 路径字符串:', pathString)
  params.append('paths', pathString)
  
  // 添加起点和终点标记
  const markersString = `small,0x667eea,A:${points[0][0]},${points[0][1]}|small,0x667eea,B:${points[points.length-1][0]},${points[points.length-1][1]}`
  console.log('📍 标记字符串:', markersString)
  params.append('markers', markersString)
  
  const finalUrl = `${baseUrl}?${params.toString()}`
  console.log('🌐 静态地图请求URL:', finalUrl)
  
  // 验证URL是否有效
  try {
    const url = new URL(finalUrl)
    console.log('✅ URL格式正确')
  } catch (e) {
    console.error('❌ URL格式错误:', e)
  }
  
  return finalUrl
}

// 计算路线边界
const calculateBounds = (points) => {
  let minLng = points[0][0], maxLng = points[0][0]
  let minLat = points[0][1], maxLat = points[0][1]
  
  points.forEach(point => {
    const [lng, lat] = point
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  })
  
  return {
    southwest: { lng: minLng, lat: minLat },
    northeast: { lng: maxLng, lat: maxLat }
  }
}

// 计算适合的缩放级别
const calculateZoomLevel = (bounds, width, height) => {
  const WORLD_DIM = { height: 256, width: 256 }
  const ZOOM_MAX = 18
  
  function latRad(lat) {
    const sin = Math.sin(lat * Math.PI / 180)
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }
  
  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }
  
  const latFraction = (latRad(bounds.northeast.lat) - latRad(bounds.southwest.lat)) / Math.PI
  const lngDiff = bounds.northeast.lng - bounds.southwest.lng
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360
  
  const latZoom = zoom(height, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(width, WORLD_DIM.width, lngFraction)
  
  return Math.min(Math.min(latZoom, lngZoom), ZOOM_MAX)
}

// 编码路径数据用于静态地图
const encodePathForStaticMap = (points) => {
  const pathString = points.map(point => `${point[0]},${point[1]}`).join(';')
  return `10,0x667eea,1,,:${pathString}`
}

// 测试高德静态地图API是否正常工作
export const testStaticMapAPI = async () => {
  try {
    const testPoints = [
      [102.69423499999999, 24.8265315],
      [102.685507, 24.968828],
      [102.685507, 24.968831]
    ]
    
    console.log('🧪 测试高德静态地图API...')
    
    const baseUrl = 'https://restapi.amap.com/v3/staticmap'
    const params = new URLSearchParams({
      key: AMAP_CONFIG.webKey,
      center: '102.69423499999999,24.8265315',
      zoom: 9,
      size: '300*200',
      scale: 2,
      format: 'jpg',
      maptype: 'normal'
    })
    
    // 添加测试路径
    const pathString = `10,0x667eea,1,,:${testPoints.map(p => `${p[0]},${p[1]}`).join(';')}`
    params.append('paths', pathString)
    
    const testUrl = `${baseUrl}?${params.toString()}`
    console.log('🧪 测试URL:', testUrl)
    
    // 创建一个测试图片元素来验证URL是否有效
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        console.log('✅ 高德静态地图API测试成功')
        resolve(true)
      }
      img.onerror = (error) => {
        console.error('❌ 高德静态地图API测试失败:', error)
        reject(false)
      }
      img.src = testUrl
    })
  } catch (error) {
    console.error('🧪 高德静态地图API测试异常:', error)
    return false
  }
}

// GPX文件解析
export const parseGPXFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const gpxContent = e.target.result
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(gpxContent, 'text/xml')
        
        // 解析GPX数据
        const trackPoints = xmlDoc.querySelectorAll('trkpt')
        const points = []
        let totalDistance = 0
        let minElevation = Infinity
        let maxElevation = -Infinity
        
        trackPoints.forEach((point, index) => {
          const lat = parseFloat(point.getAttribute('lat'))
          const lon = parseFloat(point.getAttribute('lon'))
          const ele = point.querySelector('ele')
          const elevation = ele ? parseFloat(ele.textContent) : 0
          
          points.push([lon, lat])
          
          // 计算累计爬升
          if (elevation > maxElevation) maxElevation = elevation
          if (elevation < minElevation) minElevation = elevation
          
          // 计算距离 (简化计算)
          if (index > 0) {
            const prevPoint = points[index - 1]
            const distance = calculateDistance(
              prevPoint[1], prevPoint[0],
              lat, lon
            )
            totalDistance += distance
          }
        })
        
        // 提取路线信息
        const name = xmlDoc.querySelector('name')?.textContent || '未命名路线'
        const desc = xmlDoc.querySelector('desc')?.textContent || ''
        
        const routeData = {
          name,
          description: desc,
          points,
          distance: Math.round(totalDistance / 1000 * 10) / 10, // 转换为公里
          elevation: Math.round(maxElevation - minElevation),
          estimatedTime: calculateEstimatedTime(totalDistance / 1000),
          difficulty: calculateDifficulty(totalDistance / 1000, maxElevation - minElevation)
        }
        
        resolve(routeData)
      } catch (error) {
        reject(new Error('GPX文件解析失败: ' + error.message))
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 计算两点间距离 (Haversine公式)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000 // 地球半径(米)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 计算预计时间
const calculateEstimatedTime = (distance) => {
  const avgSpeed = 20 // 平均速度 20km/h
  const hours = distance / avgSpeed
  
  if (hours < 1) {
    return `${Math.round(hours * 60)}分钟`
  } else if (hours < 2) {
    return `${Math.floor(hours)}小时${Math.round((hours % 1) * 60)}分钟`
  } else {
    return `${Math.round(hours)}小时`
  }
}

// 计算难度等级
const calculateDifficulty = (distance, elevation) => {
  const score = distance * 0.3 + elevation * 0.01
  
  if (score < 10) return 'easy'
  if (score < 30) return 'medium'
  return 'hard'
}