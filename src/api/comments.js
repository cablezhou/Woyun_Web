/**
 * 评论相关API接口
 */
import { http } from './axios.js'

/**
 * 获取动态的评论列表
 * @param {number} postId - 动态ID
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise<Object>} 分页评论列表
 */
export const getPostComments = async (postId, params = {}) => {
  try {
    const { page = 0, size = 20 } = params
    const response = await http.get(`/api/posts/${postId}/comments`, {
      params: { page, size }
    })
    return response
  } catch (error) {
    console.error('获取评论列表失败:', error.message)
    throw error
  }
}

/**
 * 发表评论或回复
 * @param {number} postId - 动态ID
 * @param {Object} commentData - 评论数据
 * @param {string} commentData.content - 评论内容
 * @param {number} commentData.parentId - 父评论ID（回复时提供）
 * @returns {Promise<Object>} 新创建的评论信息
 */
export const createComment = async (postId, commentData) => {
  try {
    const response = await http.post(`/api/posts/${postId}/comments`, commentData)
    return response
  } catch (error) {
    console.error('发表评论失败:', error.message)
    throw error
  }
}

/**
 * 删除评论
 * @param {number} commentId - 评论ID
 * @returns {Promise<void>}
 */
export const deleteComment = async (commentId) => {
  try {
    await http.delete(`/api/comments/${commentId}`)
  } catch (error) {
    console.error('删除评论失败:', error.message)
    throw error
  }
}

/**
 * 点赞评论
 * @param {number} commentId - 评论ID
 * @returns {Promise<Object>} 返回新的点赞数
 */
export const likeComment = async (commentId) => {
  try {
    const response = await http.post(`/api/comments/${commentId}/like`)
    return response
  } catch (error) {
    console.error('点赞评论失败:', error.message)
    throw error
  }
}

/**
 * 取消点赞评论
 * @param {number} commentId - 评论ID
 * @returns {Promise<Object>} 返回新的点赞数
 */
export const unlikeComment = async (commentId) => {
  try {
    const response = await http.delete(`/api/comments/${commentId}/like`)
    return response
  } catch (error) {
    console.error('取消点赞评论失败:', error.message)
    throw error
  }
}