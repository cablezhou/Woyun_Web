/**
 * 用户信息相关API接口
 */
import { http } from './axios.js'

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 当前用户的完整个人主页信息
 */
export const getCurrentUserInfo = async () => {
  try {
    const response = await http.get('/api/users/me')
    return response
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    throw error
  }
}

/**
 * 获取指定用户信息
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 指定用户的公开主页信息
 */
export const getUserInfo = async (userId) => {
  try {
    const response = await http.get(`/api/users/${userId}`)
    return response
  } catch (error) {
    console.error('获取用户信息失败:', error.message)
    throw error
  }
}

/**
 * 更新当前用户信息
 * @param {Object} userInfo - 要更新的用户信息
 * @param {string} userInfo.name - 昵称
 * @param {string} userInfo.title - Title
 * @param {string} userInfo.bio - 简介
 * @returns {Promise<Object>} 更新后的用户信息
 */
export const updateUserInfo = async (userInfo) => {
  try {
    const response = await http.put('/api/users/me', userInfo)
    return response
  } catch (error) {
    console.error('更新用户信息失败:', error.message)
    throw error
  }
}

/**
 * 上传/更换头像
 * @param {File} avatarFile - 头像文件
 * @returns {Promise<Object>} 返回新的头像URL
 */
export const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    
    const response = await http.upload('/api/users/me/avatar', formData)
    return response
  } catch (error) {
    console.error('头像上传失败:', error.message)
    throw error
  }
}

/**
 * 获取用户相册
 * @param {number} userId - 用户ID
 * @returns {Promise<Array>} 用户的所有相册照片，按时间倒序
 */
export const getUserPhotos = async (userId) => {
  try {
    const response = await http.get(`/api/users/${userId}/photos`)
    return response
  } catch (error) {
    console.error('获取用户相册失败:', error.message)
    throw error
  }
}

/**
 * 上传照片到相册
 * @param {Array<File>} files - 要上传的图片文件数组
 * @returns {Promise<Array>} 返回上传成功的照片信息数组
 */
export const uploadPhotos = async (files) => {
  try {
    const formData = new FormData()
    
    // 添加多个文件
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await http.upload('/api/users/me/photos', formData)
    return response
  } catch (error) {
    console.error('照片上传失败:', error.message)
    throw error
  }
}

/**
 * 从相册删除照片
 * @param {number} photoId - 照片ID
 * @returns {Promise<void>}
 */
export const deletePhoto = async (photoId) => {
  try {
    await http.delete(`/api/users/me/photos/${photoId}`)
  } catch (error) {
    console.error('删除照片失败:', error.message)
    throw error
  }
}

/**
 * 获取指定用户的动态列表
 * @param {number} userId - 用户ID
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise<Object>} 分页的动态列表
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
 * 批量更新用户信息（包括头像等）
 * @param {Object} updateData - 要更新的数据
 * @returns {Promise<Object>} 更新后的用户信息
 */
export const batchUpdateUserInfo = async (updateData) => {
  try {
    // 如果包含头像文件，先上传头像
    if (updateData.avatarFile) {
      const avatarResult = await uploadAvatar(updateData.avatarFile)
      updateData.avatarUrl = avatarResult.avatarUrl
      delete updateData.avatarFile
    }
    
    // 更新基本信息
    const response = await updateUserInfo(updateData)
    return response
  } catch (error) {
    console.error('批量更新用户信息失败:', error.message)
    throw error
  }
}