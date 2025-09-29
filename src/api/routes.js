/**
 * 骑行路线相关API接口
 */
import { http } from './axios.js'

/**
 * 获取路线列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.difficulty - 难度等级 (easy, medium, hard)
 * @param {string} params.type - 路线类型 (mountain, road, city, scenic)
 * @param {string} params.keyword - 关键词搜索
 * @returns {Promise<Object>} 分页路线列表
 */
export const getRoutes = async (params = {}) => {
  try {
    const response = await http.get('/api/routes', { params })
    return response
  } catch (error) {
    console.error('获取路线列表失败:', error.message)
    throw error
  }
}

/**
 * 获取路线详情
 * @param {number} routeId - 路线ID
 * @returns {Promise<Object>} 路线详情
 */
export const getRouteDetail = async (routeId) => {
  try {
    const response = await http.get(`/api/routes/${routeId}`)
    return response
  } catch (error) {
    console.error('获取路线详情失败:', error.message)
    throw error
  }
}

/**
 * 获取路线点位数据
 * @param {number} routeId - 路线ID
 * @returns {Promise<Array>} 路线点位数组
 */
export const getRoutePoints = async (routeId) => {
  try {
    const response = await http.get(`/api/routes/${routeId}/points`)
    return response
  } catch (error) {
    console.error('获取路线点位失败:', error.message)
    throw error
  }
}

/**
 * 创建新路线
 * @param {Object} routeData - 路线数据
 * @param {File} gpxFile - GPX文件
 * @returns {Promise<Object>} 创建的路线信息
 */
export const createRoute = async (routeData, gpxFile) => {
  try {
    const formData = new FormData()
    
    // 添加路线数据（使用Blob确保正确的Content-Type）
    const routeBlob = new Blob([JSON.stringify(routeData)], {
      type: "application/json"
    })
    formData.append('route', routeBlob)
    
    // 添加GPX文件
    if (gpxFile) {
      formData.append('gpxFile', gpxFile)
    }
    
    const response = await http.upload('/api/routes', formData)
    return response
  } catch (error) {
    console.error('创建路线失败:', error.message)
    throw error
  }
}

/**
 * 更新路线
 * @param {number} routeId - 路线ID
 * @param {Object} routeData - 路线数据
 * @returns {Promise<Object>} 更新后的路线信息
 */
export const updateRoute = async (routeId, routeData) => {
  try {
    const response = await http.put(`/api/routes/${routeId}`, routeData)
    return response
  } catch (error) {
    console.error('更新路线失败:', error.message)
    throw error
  }
}

/**
 * 删除路线
 * @param {number} routeId - 路线ID
 * @returns {Promise<void>}
 */
export const deleteRoute = async (routeId) => {
  try {
    await http.delete(`/api/routes/${routeId}`)
  } catch (error) {
    console.error('删除路线失败:', error.message)
    throw error
  }
}

/**
 * 下载路线GPX文件
 * @param {number} routeId - 路线ID
 * @returns {Promise<Blob>} GPX文件Blob
 */
export const downloadGPX = async (routeId) => {
  try {
    const response = await http.get(`/api/routes/${routeId}/gpx`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('下载GPX文件失败:', error.message)
    throw error
  }
}

/**
 * 获取用户创建的路线
 * @param {number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 * @returns {Promise<Object>} 分页路线列表
 */
export const getUserRoutes = async (userId, params = {}) => {
  try {
    const response = await http.get(`/api/users/${userId}/routes`, { params })
    return response
  } catch (error) {
    console.error('获取用户路线失败:', error.message)
    throw error
  }
}

/**
 * 点赞路线
 * @param {number} routeId - 路线ID
 * @returns {Promise<Object>} 返回新的点赞数
 */
export const likeRoute = async (routeId) => {
  try {
    const response = await http.post(`/api/routes/${routeId}/like`)
    return response
  } catch (error) {
    console.error('点赞路线失败:', error.message)
    throw error
  }
}

/**
 * 取消点赞路线
 * @param {number} routeId - 路线ID
 * @returns {Promise<Object>} 返回新的点赞数
 */
export const unlikeRoute = async (routeId) => {
  try {
    const response = await http.delete(`/api/routes/${routeId}/like`)
    return response
  } catch (error) {
    console.error('取消点赞失败:', error.message)
    throw error
  }
}