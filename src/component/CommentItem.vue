<template>
  <div class="comment-item">
    <div class="comment-header">
      <img :src="comment.user.avatar" :alt="comment.user.name" class="comment-avatar">
      <div class="comment-info">
        <span class="comment-user">{{ comment.user.name }}</span>
        <span v-if="isReply && comment.replyTo" class="reply-info">
          <span class="reply-to">回复</span>
          <span class="reply-target">{{ comment.replyTo.name }}</span>
        </span>
        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
      </div>
    </div>

    <div class="comment-content">
      <p>{{ comment.content }}</p>
    </div>

    <div class="comment-actions">
      <button @click="toggleReplyForm" class="reply-btn">
        回复
      </button>
    </div>

    <div v-if="showReplyForm" class="reply-form">
      <div class="reply-input-container">
        <input 
          v-model="replyText"
          type="text"
          :placeholder="`回复 ${comment.user.name}:`"
          @keyup.enter="submitReply"
        >
        <button @click="submitReply" class="reply-submit" :disabled="!replyText.trim()">回复</button>
      </div>
    </div>

    <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :is-reply="true"
        :post-id="postId"
        @reply-submitted="$emit('replySubmitted')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../stores/auth.js'
import { createComment } from '../api/comments.js' // 引入API
import { ElMessage } from 'element-plus'

// 定义组件名称，用于递归
defineOptions({
  name: 'CommentItem'
})

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  },
  postId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['replySubmitted'])

const showReplyForm = ref(false)
const replyText = ref('')

const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
}

const submitReply = async () => {
  if (!replyText.value.trim()) return

  try {
    const commentData = {
      content: replyText.value.trim(),
      parentId: props.comment.id // 关键：将被回复的评论ID作为parentId
    }

    // 使用从props传入的postId
    await createComment(props.postId, commentData)

    ElMessage.success('回复成功')
    replyText.value = ''
    showReplyForm.value = false

    // 发射事件，通知父组件（PostDetail）刷新整个评论列表
    emit('replySubmitted')

  } catch (error) {
    console.error('发表回复失败:', error)
    ElMessage.error('发表回复失败')
  }
}

// 复用时间格式化函数
const formatTime = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
}
</script>

<style scoped>
.comment-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e1e5e9;
}

.comment-info {
  display: flex;
  flex-direction: column;
}

.comment-user {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.reply-to {
  font-size: 0.8rem;
  color: #999;
}

.reply-target {
  font-weight: 600;
  color: #667eea;
  font-size: 0.85rem;
}

.comment-time {
  font-size: 0.75rem;
  color: #999;
  margin-top: 2px;
}

.comment-content p {
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
}

.comment-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
}

.reply-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 5px 10px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.reply-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #5a6fd8;
}

.reply-form {
  margin-top: 15px;
  padding: 15px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e1e5e9;
}

.reply-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reply-input-container input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e1e5e9;
  border-radius: 20px;
  font-size: 0.85rem;
}

.reply-input-container input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.reply-submit {
  padding: 8px 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.3s ease;
}

.reply-submit:hover:not(:disabled) {
  background: #5a6fd8;
}

.reply-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.replies-list {
  margin-top: 15px;
  padding-left: 30px;
  border-left: 2px solid #e1e5e9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-item {
    padding: 15px;
  }
  
  .comment-header {
    gap: 10px;
  }
  
  .comment-avatar {
    width: 32px;
    height: 32px;
  }
  
  .replies-list {
    padding-left: 20px;
  }
  
  .reply-input-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .reply-submit {
    align-self: flex-end;
  }
}
</style>