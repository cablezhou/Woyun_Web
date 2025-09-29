<template>
  <div class="post-detail">
    <!-- 顶部导航 (复用) -->
    <el-header class="header">
      <div class="title">
        <img src="/imagines/logo.jpg" alt="卧云车队">
        <div class="divider">|</div>
        <div class="title-text">卧云车队</div>
      </div>
      <el-menu mode="horizontal" 
        :default-active="activeMenu" 
        @select="handleMenuSelect"
        class="nav-menu"
      >
        <el-menu-item index="1">首页</el-menu-item>
        <el-sub-menu index="2">
          <template #title>车队介绍</template>
          <el-menu-item index="2-1">历史沿革</el-menu-item>
          <el-menu-item index="2-2">车队成员</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="3">骑行路线</el-menu-item>
        <el-menu-item index="4">活动动态</el-menu-item>
        <el-menu-item index="5">卧云社区</el-menu-item>
        <el-menu-item index="6">联系我们</el-menu-item>
      </el-menu>
    </el-header>

    <!-- 固定背景图 -->
    <div class="post-detail-background" ref="backgroundRef"></div>

    <div class="post-detail-container">
      <!-- 返回按钮 -->
      <div class="back-nav">
        <button @click="goBack" class="back-btn">
          ← 返回社区
        </button>
      </div>

      <!-- 动态详情 -->
      <div v-if="post" class="post-detail-content fade-in-up" ref="detailContentRef">
        <!-- 动态头部 -->
        <div class="post-header">
          <div class="post-user">
            <img 
              :src="post.user.avatar" 
              :alt="post.user.name" 
              class="user-avatar"
              @click="viewUserProfile(post.user.id)"
              style="cursor: pointer;"
            >
            <div class="user-info">
              <h3 
                @click="viewUserProfile(post.user.id)"
                style="cursor: pointer;"
              >{{ post.user.name }}</h3>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 动态内容 -->
        <div class="post-content">
          <p class="post-text">{{ post.content }}</p>
          
          <!-- 图片展示 -->
          <div v-if="post.images.length > 0" class="post-images">
            <div 
              v-for="(image, index) in post.images" 
              :key="index"
              class="image-item"
              @click="viewImage(image, post.images, index)"
            >
              <img :src="image" :alt="`动态图片 ${index + 1}`">
            </div>
          </div>
        </div>

        <!-- 动态操作栏 -->
        <div class="post-actions">
          <button 
            @click="toggleLike"
            :class="['action-btn', 'like-btn', { liked: post.isLiked }]"
          >
            <span class="icon">👍</span>
            <span>{{ post.likes }}</span>
          </button>
          <div class="action-btn comment-count">
            <span class="icon">💬</span>
            <span>{{ post.commentCount }}</span>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="comments-section">
          <h3>评论 ({{ post.commentCount }})</h3>
          
          <!-- 发表评论 -->
          <div class="comment-form">
            <div class="current-user-avatar">
              <img :src="userAvatar" :alt="currentUser?.name">
            </div>
            <div class="comment-input-area">
              <textarea 
                v-model="newCommentText"
                placeholder="写下你的评论..."
                rows="3"
                maxlength="300"
              ></textarea>
              <div class="comment-actions">
                <span class="char-count">{{ newCommentText.length }}/300</span>
                <button @click="addComment" class="comment-submit" :disabled="!newCommentText.trim()">
                  发表评论
                </button>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <CommentItem
              v-for="comment in post.comments" 
              :key="comment.id"
              :comment="comment"
              :post-id="post.id"
              @reply-submitted="handleReplySubmitted"
            />
            
            <div v-if="!post.comments || post.comments.length === 0" class="no-comments">
              <p>暂无评论，快来发表第一条评论吧！</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="isLoading" class="loading">
        <el-loading text="正在加载动态详情..."></el-loading>
      </div>
      
      <!-- 动态不存在 -->
      <div v-else class="not-found">
        <p>动态不存在或已被删除</p>
        <button @click="goBack" class="back-btn">返回社区</button>
      </div>
    </div>

    <!-- 图片查看器 -->
    <div v-if="showImageViewer" class="image-viewer" @click="closeImageViewer">
      <div class="viewer-content" @click.stop>
        <img :src="currentViewImage" alt="查看图片">
        <button @click="closeImageViewer" class="close-viewer">×</button>
        <button v-if="viewerImages.length > 1" @click="prevImage" class="nav-btn prev-btn">‹</button>
        <button v-if="viewerImages.length > 1" @click="nextImage" class="nav-btn next-btn">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../stores/auth.js'
import { getPostDetail, likePost, unlikePost } from '../api/posts.js'
import { getPostComments, createComment } from '../api/comments.js'
import { ElMessage, ElLoading } from 'element-plus'
import CommentItem from '../component/CommentItem.vue'
import '../style/header.css'
import { getFullImageUrl, processImageUrls } from '../config/index.js'
import { loadImageWithHeaders, loadImagesWithHeaders } from '../utils/imageLoader.js'

const route = useRoute()
const router = useRouter()
const { currentUser, userAvatar } = useAuth()
const activeMenu = ref('5')

// 状态管理
const post = ref(null)
const isLoading = ref(true)
const showImageViewer = ref(false)
const currentViewImage = ref('')
const viewerImages = ref([])
const currentImageIndex = ref(0)
const newCommentText = ref('')
const detailContentRef = ref(null)
const backgroundRef = ref(null)

// 方法
const handleMenuSelect = (key) => {
  activeMenu.value = key
  if (key === '1') {
    router.push('/')
  } else if (key === '2-2') {
    router.push('/team-member')
  } else if (key === '5') {
    router.push('/community')
  }
}

const goBack = () => {
  router.push({ name: 'community' })
}

// 跳转到用户个人主页
const viewUserProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

// 加载动态详情
const loadPostDetail = async (postId) => {
  try {
    isLoading.value = true
    
    const postData = await getPostDetail(postId)
    
    // 处理动态数据 - 使用统一的图片URL处理函数
    const fullAuthorAvatar = getFullImageUrl(postData.author?.avatarUrl)
    const processedImages = processImageUrls(postData.imageUrls || [])
    
    // 使用新的图片加载工具处理头像和图片
    const processedAvatar = await loadImageWithHeaders(fullAuthorAvatar)
    const processedImageUrls = await loadImagesWithHeaders(processedImages)
    
    post.value = {
      id: postData.id,
      content: postData.content,
      images: processedImageUrls,
      user: {
        id: postData.author?.id,
        name: postData.author?.name || postData.author?.username,
        avatar: processedAvatar
      },
      likes: postData.likeCount || 0,
      isLiked: postData.isLiked || false,
      createdAt: new Date(postData.createdAt),
      comments: [], // 初始化为空数组
      commentCount: postData.commentCount || 0
    }
    
    // 加载评论
    await loadComments(postId)
    
  } catch (error) {
    console.error('加载动态详情失败:', error)
    ElMessage.error('加载动态详情失败')
    // 加载失败，返回社区
    setTimeout(() => {
      router.push({ name: 'community' })
    }, 2000)
  } finally {
    isLoading.value = false
  }
}

// 加载评论列表
const loadComments = async (postId) => {
  try {
    const responseData = await getPostComments(postId, { page: 0, size: 50 });
    
    if (post.value) {
      // 创建一个可复用的辅助函数，用于处理任意层级的评论
      const processComment = (comment) => {
        // 使用统一的图片URL处理函数
        const fullAvatarUrl = getFullImageUrl(comment.author?.avatarUrl);
        
        return {
          id: comment.id,
          content: comment.content,
          user: {
            id: comment.author?.id,
            name: comment.author?.name || comment.author?.username,
            avatar: fullAvatarUrl
          },
          createdAt: new Date(comment.createdAt),
          showReply: false,
          replies: (comment.replies || []).map(processComment) // 递归处理回复
        };
      };
      
      // 处理评论列表
      const processedComments = (responseData.content || responseData || []).map(processComment);
      
      post.value.comments = processedComments;
      post.value.commentCount = processedComments.length;
      
      console.log('✅ 评论加载完成:', {
        评论数量: processedComments.length,
        评论数据: processedComments
      });
    }
  } catch (error) {
    console.error('❌ 加载评论失败:', error);
    ElMessage.error('加载评论失败');
  }
}

const toggleLike = async () => {
  if (!post.value) return
  
  try {
    if (post.value.isLiked) {
      // 取消点赞
      const result = await unlikePost(post.value.id)
      post.value.likes = result.likeCount
      post.value.isLiked = false
    } else {
      // 点赞
      const result = await likePost(post.value.id)
      post.value.likes = result.likeCount
      post.value.isLiked = true
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('点赞操作失败')
  }
}

const addComment = async () => {
  if (!newCommentText.value.trim() || !post.value) return
  
  try {
    const commentData = {
      content: newCommentText.value.trim()
    }
    
    const newComment = await createComment(post.value.id, commentData)
    
    // 处理评论数据 - 使用统一的图片URL处理函数
    const fullAvatarUrl = getFullImageUrl(newComment.author?.avatarUrl)
    
    const processedComment = {
      id: newComment.id,
      content: newComment.content,
      user: {
        id: newComment.author?.id,
        name: newComment.author?.name || newComment.author?.username,
        avatar: fullAvatarUrl
      },
      createdAt: new Date(newComment.createdAt),
      showReply: false,
      replies: []
    }
    
    post.value.comments.push(processedComment)
    post.value.commentCount++
    newCommentText.value = ''
    
    ElMessage.success('评论发表成功')
    
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  }
}

// 新增一个方法，用于在回复成功后刷新评论列表
const handleReplySubmitted = () => {
  if (post.value) {
    console.log('检测到回复已提交，正在刷新评论区...')
    // 重新调用加载评论的函数
    loadComments(post.value.id)
    // 同时可以乐观更新一下评论总数
    post.value.commentCount++
  }
}


const viewImage = (imageUrl, images, index) => {
  currentViewImage.value = imageUrl
  viewerImages.value = images
  currentImageIndex.value = index
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    currentViewImage.value = viewerImages.value[currentImageIndex.value]
  }
}

const nextImage = () => {
  if (currentImageIndex.value < viewerImages.value.length - 1) {
    currentImageIndex.value++
    currentViewImage.value = viewerImages.value[currentImageIndex.value]
  }
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 生命周期
onMounted(async () => {
  // 从路由参数获取动态ID
  const postId = parseInt(route.params.id)
  
  if (!postId || isNaN(postId)) {
    ElMessage.error('无效的动态ID')
    router.push({ name: 'community' })
    return
  }
  
  // 背景渐显动画
  if (backgroundRef.value) {
    backgroundRef.value.classList.add('background-fade-in')
  }
  
  // 加载动态详情
  await loadPostDetail(postId)
  
  // 动画效果
  if (post.value && detailContentRef.value) {
    setTimeout(() => {
      detailContentRef.value.classList.add('fade-in-active')
    }, 100)
  }
})
</script>

<style scoped>
@import '../style/postDetail.css';
</style>