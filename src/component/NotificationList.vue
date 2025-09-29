<template>
  <div class="notification-list" v-if="visible">
    <div class="notification-header">
      <h3>通知</h3>
      <div class="notification-actions">
        <button 
          v-if="notifications.length > 0" 
          @click="markAllAsRead" 
          class="mark-all-read-btn"
          :disabled="isMarkingAllRead"
        >
          {{ isMarkingAllRead ? '标记中...' : '全部已读' }}
        </button>
        <button @click="closeNotifications" class="close-btn">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
    
    <div class="notification-content">
      <div v-if="isLoading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="notifications.length === 0" class="empty-state">
        <el-icon><Bell /></el-icon>
        <p>暂无通知</p>
      </div>
      
      <div v-else class="notification-items">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <el-icon v-if="notification.type === 'LIKE'"><Star /></el-icon>
            <el-icon v-else-if="notification.type === 'COMMENT'"><ChatDotRound /></el-icon>
            <el-icon v-else-if="notification.type === 'REPLY'"><ChatLineRound /></el-icon>
            <el-icon v-else><Bell /></el-icon>
          </div>
          
          <div class="notification-content-text">
            <div class="notification-message">
              {{ formatNotificationMessage(notification) }}
            </div>
            <div v-if="notification.content" class="notification-preview">
              "{{ notification.content }}"
            </div>
            <div class="notification-time">
              {{ formatTime(notification.createdAt) }}
            </div>
          </div>
          
          <div v-if="!notification.read" class="unread-dot"></div>
        </div>
      </div>
      
      <div v-if="hasMore && !isLoading" class="load-more">
        <button @click="loadMore" class="load-more-btn" :disabled="isLoadingMore">
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotifications, markAllNotificationsAsRead } from '../api/notifications.js'
import { ElMessage, ElIcon } from 'element-plus'
import { Bell, Close, Loading, Star, ChatDotRound, ChatLineRound } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'unread-count-updated'])

const router = useRouter()

// 状态管理
const notifications = ref([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isMarkingAllRead = ref(false)
const currentPage = ref(0)
const hasMore = ref(true)
const pageSize = 20

// 加载通知列表
const loadNotifications = async (page = 0, append = false) => {
  try {
    if (page === 0) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }
    
    const response = await getNotifications({ page, size: pageSize })
    const newNotifications = response.data?.content || []
    
    if (append) {
      notifications.value = [...notifications.value, ...newNotifications]
    } else {
      notifications.value = newNotifications
    }
    
    hasMore.value = !response.data?.last
    currentPage.value = page
    
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error('加载通知失败')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    loadNotifications(currentPage.value + 1, true)
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  try {
    isMarkingAllRead.value = true
    await markAllNotificationsAsRead()
    
    // 更新本地状态
    notifications.value.forEach(notification => {
      notification.read = true
    })
    
    // 通知父组件更新未读数量
    emit('unread-count-updated', 0)
    
    ElMessage.success('已标记所有通知为已读')
  } catch (error) {
    console.error('标记通知为已读失败:', error)
    ElMessage.error('操作失败')
  } finally {
    isMarkingAllRead.value = false
  }
}

// 关闭通知列表
const closeNotifications = () => {
  emit('close')
}

// 处理通知点击
const handleNotificationClick = (notification) => {
  // 跳转到相关动态详情页
  if (notification.postId) {
    router.push(`/community/post/${notification.postId}`)
    closeNotifications()
  }
}

// 格式化通知消息
const formatNotificationMessage = (notification) => {
  const senderName = notification.senderName || '某用户'
  
  switch (notification.type) {
    case 'LIKE':
      return `${senderName} 点赞了你的动态`
    case 'COMMENT':
      return `${senderName} 评论了你的动态`
    case 'REPLY':
      return `${senderName} 回复了你的评论`
    default:
      return notification.message || '新通知'
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return time.toLocaleDateString()
}

// 监听可见性变化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    loadNotifications(0)
  }
})
</script>

<style scoped>
.notification-list {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mark-all-read-btn {
  padding: 4px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.mark-all-read-btn:hover:not(:disabled) {
  background: #337ecc;
}

.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-btn {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.notification-content {
  max-height: 500px;
  overflow-y: auto;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
}

.loading-state .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #ddd;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f8ff;
}

.notification-icon {
  margin-right: 12px;
  margin-top: 2px;
}

.notification-icon .el-icon {
  font-size: 18px;
  color: #409eff;
}

.notification-content-text {
  flex: 1;
}

.notification-message {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
}

.notification-preview {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
  font-style: italic;
}

.notification-time {
  font-size: 0.8rem;
  color: #999;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  margin-left: 8px;
  margin-top: 6px;
}

.load-more {
  padding: 16px 20px;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

.load-more-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: background 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #e9e9e9;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>