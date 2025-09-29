/**
 * 社区动态相关API接口
 */
import { http } from './axios.js'
import axios from 'axios'
import { API_CONFIG } from '../config/index.js'

// 为文件上传创建一个完全独立的axios实例，避免任何默认配置干扰
const createUploadClient = () => {
  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: 30000,
    // 完全没有默认headers
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  })
  
  // 添加专门的请求拦截器，只处理认证
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('woyun_token')
      
      // 确保headers对象存在
      if (!config.headers) {
        config.headers = {}
      }
      
      // 只添加Authorization，绝对不添加Content-Type
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // 确保删除任何可能的Content-Type设置
      //delete config.headers['Content-Type']
      //delete config.headers['content-type']
      
      console.log('🔧 文件上传客户端请求拦截器:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        hasFormData: config.data instanceof FormData
      })
      
      return config
    },
    (error) => {
      console.error('❌ 文件上传请求配置错误:', error)
      return Promise.reject(error)
    }
  )
  
  return client
}

/**
 * 获取动态列表（首页）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 * @returns {Promise<Object>} 分页动态列表
 */
export const getPosts = async (params = {}) => {
  try {
    const { page = 0, size = 10 } = params
    const response = await http.get('/api/posts', {
      params: { page, size }
    })
    return response
  } catch (error) {
    console.error('获取动态列表失败:', error.message)
    throw error
  }
}

/**
 * 获取指定用户的动态列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise<Object>} 分页动态列表
 */
export const getUserPosts = async (userId, params = {}) => {
  try {
    const { page = 0, size = 10 } = params
    const response = await http.get(`/api/users/${userId}/posts`, {
      params: { page, size }
    })
    return response
  } catch (error) {
    console.error('获取用户动态失败:', error.message)
    throw error
  }
}

/**
 * 获取动态详情
 * @param {number} postId - 动态ID
 * @returns {Promise<Object>} 动态详情
 */
export const getPostDetail = async (postId) => {
  try {
    const response = await http.get(`/api/posts/${postId}`)
    return response
  } catch (error) {
    console.error('获取动态详情失败:', error.message)
    throw error
  }
}

/**
 * 发布新动态
 * @param {Object} postData - 动态数据
 * @param {string} postData.content - 动态内容
 * @param {Array<File>} files - 图片文件数组（可选）
 * @returns {Promise<Object>} 新创建的动态信息
 */
export const createPost = async (postData, files = []) => {
  try {
    const formData = new FormData()
    
    // 添加动态内容（关键修复：使用Blob显式设置Content-Type）
    const postBlob = new Blob([JSON.stringify(postData)], {
        type: "application/json"
    });
    formData.append('post', postBlob);
    
    console.log('✅ JSON数据块处理（已修复Content-Type问题）:', {
      originalData: postData,
      jsonString: JSON.stringify(postData),
      blobType: postBlob.type,
      blobSize: postBlob.size
    });
    
    // 验证并添加图片文件
    files.forEach((file, index) => {
      if (file instanceof File) {
        formData.append('files', file)
        console.log(`✅ 添加文件 ${index}:`, {
          name: file.name,
          type: file.type,
          size: file.size,
          isFile: file instanceof File,
          constructor: file.constructor.name
        })
      } else {
        console.error(`❌ 非法文件对象 ${index}:`, file)
      }
    })
    
    // 打印调试信息
    console.log('📝 发布动态调试（已修复Content-Type问题）:', {
      postData,
      filesCount: files.length,
      validFilesCount: files.filter(f => f instanceof File).length,
      formDataKeys: Array.from(formData.keys()),
      formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
        key,
        valueType: typeof value,
        isFile: value instanceof File,
        isBlob: value instanceof Blob,
        fileName: value instanceof File ? value.name : null,
        fileType: value instanceof File ? value.type : (value instanceof Blob ? value.type : null)
      }))
    })
    
    // 使用专用的上传客户端
    console.log('🚀 使用专用上传客户端发送请求...')
    
    const uploadClient = createUploadClient()
    const response = await uploadClient.post('/api/posts', formData)
    
    console.log('📨 上传成功响应:', response)
    
    // 检查业务状态码
    if (response.data.code === 200) {
      return response.data.data
    } else {
      throw new Error(response.data.message || '发布动态失败')
    }
    
  } catch (error) {
    console.error('发布动态失败:', error.message || error)
    
    // 打印更详细的错误信息
    if (error.response) {
      console.error('❌ 错误响应详情:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      })
    }
    
    throw error
  }
}

/**
 * 删除动态
 * @param {number} postId - 动态ID
 * @returns {Promise<void>}
 */
export const deletePost = async (postId) => {
  try {
    await http.delete(`/api/posts/${postId}`)
  } catch (error) {
    console.error('删除动态失败:', error.message)
    throw error
  }
}

/**
 * 点赞动态
 * @param {number} postId - 动态ID
 * @returns {Promise<Object>} 返回新的点赞数
 */
export const likePost = async (postId) => {
  try {
    const response = await http.post(`/api/posts/${postId}/like`)
    return response
  } catch (error) {
    console.error('点赞动态失败:', error.message)
    throw error
  }
}

/**
 * 取消点赞动态
 * @param {number} postId - 动态ID
 * @returns {Promise<Object>} 返回新的点赞数
 */
export const unlikePost = async (postId) => {
  try {
    const response = await http.delete(`/api/posts/${postId}/like`)
    return response
  } catch (error) {
    console.error('取消点赞失败:', error.message)
    throw error
  }
}