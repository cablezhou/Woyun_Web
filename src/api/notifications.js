/**
 * 通知相关API接口
 */
import { http } from './axios.js'

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，从0开始
 * @param {number} params.size - 每页数量
 * @returns {Promise} 通知列表数据
 */
export const getNotifications = (params = {}) => {
  const { page = 0, size = 20 } = params
  return http.get('/api/notifications', {
    params: { page, size }
  })
}

/**
 * 获取未读通知数量
 * @returns {Promise} 未读通知数量
 */
export const getUnreadNotificationCount = () => {
  return http.get('/api/notifications/unread-count')
}

/**
 * 将所有通知标记为已读
 * @returns {Promise} 操作结果
 */
export const markAllNotificationsAsRead = () => {
  return http.post('/api/notifications/read-all')
}