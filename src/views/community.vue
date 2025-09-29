<template>
  <div class="community">
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
    <div class="community-background" ref="backgroundRef"></div>

    <div class="community-container">
    <!-- 导航头部 -->
    <div class="community-header">
      <h1>卧云社区</h1>
      <p class="subtitle">分享骑行生活，记录美好瞬间</p>
    </div>

    <!-- 登录/注册区域 -->
    <div v-if="!isLoggedIn" class="auth-section">
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <div v-if="activeTab === 'login'" class="auth-form">
        <h2>欢迎回到卧云社区</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>用户名/邮箱</label>
            <input 
              v-model="loginForm.username" 
              type="text" 
              placeholder="请输入用户名或邮箱"
              :class="{ 'error': loginErrors.username }"
              required
            >
            <span v-if="loginErrors.username" class="error-message">{{ loginErrors.username }}</span>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              :class="{ 'error': loginErrors.password }"
              required
            >
            <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
          </div>
          <button type="submit" class="auth-btn" :disabled="isLoading">
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>

      <!-- 注册表单 -->
      <div v-if="activeTab === 'register'" class="auth-form">
        <h2>加入卧云社区</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>用户名</label>
            <input 
              v-model="registerForm.username" 
              type="text" 
              placeholder="请输入用户名"
              :class="{ 'error': registerErrors.username }"
              required
            >
            <span v-if="registerErrors.username" class="error-message">{{ registerErrors.username }}</span>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input 
              v-model="registerForm.email" 
              type="email" 
              placeholder="请输入邮箱"
              :class="{ 'error': registerErrors.email }"
              required
            >
            <span v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</span>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请输入密码"
              :class="{ 'error': registerErrors.password }"
              required
            >
            <span v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</span>
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              :class="{ 'error': registerErrors.confirmPassword }"
              required
            >
            <span v-if="registerErrors.confirmPassword" class="error-message">{{ registerErrors.confirmPassword }}</span>
          </div>
          <button type="submit" class="auth-btn" :disabled="isLoading">
            <span v-if="isLoading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </form>
      </div>
    </div>

    <!-- 社区主要内容 -->
    <div v-if="isLoggedIn" class="community-content">
      <!-- 用户信息栏 -->
      <div class="user-info">
        <div class="user-avatar" @click="goToUserProfile">
          <img :src="userAvatar" :alt="userDisplayName">
        </div>
        <div class="user-details">
          <h3>{{ userDisplayName }}</h3>
          <p>{{ currentUser?.title || '卧云车队成员' }}</p>
        </div>
        <div class="user-actions">
          <!-- 通知图标 -->
          <div class="notification-icon" @click="toggleNotifications">
            <el-icon size="20">
              <Bell />
            </el-icon>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </div>
          <button @click="logout" class="logout-btn">退出登录</button>
        </div>
      </div>

      <!-- 发布动态区域 -->
      <div class="post-section">
        <div class="post-header">
          <h3>分享新动态</h3>
          <button @click="togglePostForm" class="toggle-post-btn">
            {{ showPostForm ? '取消' : '发布动态' }}
          </button>
        </div>

        <div v-if="showPostForm" class="post-form">
          <div class="post-textarea">
            <textarea 
              v-model="newPost.content"
              placeholder="分享你的骑行经历、感受或者有趣的见闻..."
              maxlength="500"
            ></textarea>
            <div class="char-count">{{ newPost.content.length }}/500</div>
          </div>

          <!-- 图片上传区域 -->
          <div class="image-upload">
            <div class="upload-grid">
              <div 
                v-for="(image, index) in newPost.images" 
                :key="index"
                class="image-preview"
              >
                <img :src="image.url" :alt="`预览图片 ${index + 1}`">
                <button @click="removeImage(index)" class="remove-img-btn">×</button>
              </div>
              <div 
                v-if="newPost.images.length < 6"
                class="upload-placeholder"
                @click="triggerImageUpload"
              >
                <i class="upload-icon">📷</i>
                <span>添加图片</span>
              </div>
            </div>
            <input 
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              style="display: none"
              @change="handleImageUpload"
            >
          </div>

          <div class="post-actions">
            <button @click="publishPost" class="publish-btn" :disabled="!canPublish">
              发布动态
            </button>
          </div>
        </div>
      </div>

      <!-- 动态列表 -->
      <div class="posts-list">
        <h3>社区动态</h3>
        <div class="posts-grid">
          <div 
            v-for="post in posts" 
            :key="post.id" 
            class="post-item fade-in-up"
            :ref="el => { if (el) postRefs[post.id] = el }"
          >
          <!-- 动态头部 -->
          <div class="post-header">
            <div class="post-user">
              <img 
                :src="post.user.avatar" 
                :alt="post.user.name" 
                class="user-avatar-small"
                @click="viewUserProfile(post.user.id)"
                style="cursor: pointer;"
              >
              <div class="user-info-small">
                <h4 
                  @click="viewUserProfile(post.user.id)"
                  style="cursor: pointer;"
                >{{ post.user.name }}</h4>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 动态内容 -->
          <div class="post-content">
            <p class="post-text" :class="{ 'text-expanded': post.showFullText }">
              {{ post.showFullText ? post.content : getTruncatedText(post.content) }}
              <span 
                v-if="post.content.length > 100 && !post.showFullText" 
                @click="toggleFullText(post.id)"
                class="expand-text"
              >
                ...展开
              </span>
              <span 
                v-if="post.showFullText && post.content.length > 100" 
                @click="toggleFullText(post.id)"
                class="collapse-text"
              >
                收起
              </span>
            </p>
            
            <!-- 图片网格 -->
            <div v-if="post.images.length > 0" class="post-images-grid">
              <div 
                v-for="(image, index) in post.images.slice(0, 3)" 
                :key="index"
                class="image-grid-item"
                @click="viewImage(image, post.images, index)"
              >
                <img :src="image" :alt="`动态图片 ${index + 1}`">
                <!-- 如果图片超过3张，在第三张上显示更多提示 -->
                <div v-if="index === 2 && post.images.length > 3" class="more-images-overlay">
                  <span>+{{ post.images.length - 3 }}</span>
                </div>
              </div>
            </div>
            
            <!-- 查看详情按钮 -->
            <div class="post-detail-btn">
              <button @click="viewPostDetail(post.id)" class="detail-btn">
                查看详情
              </button>
            </div>
          </div>

          <!-- 动态操作栏 -->
          <div class="post-actions">
            <button 
              @click="toggleLike(post.id)"
              :class="['action-btn', 'like-btn', { liked: post.isLiked }]"
            >
              <span class="icon">👍</span>
              <span>{{ post.likes }}</span>
            </button>
            <button @click="toggleComments(post.id)" class="action-btn comment-btn">
              <span class="icon">💬</span>
              <span>{{ post.commentCount }}</span>
            </button>
          </div>

          <!-- 评论区域 -->
          <div v-if="post.showComments" class="comments-section">
            <!-- 发表评论 -->
            <div class="comment-form">
              <input 
                v-model="commentTexts[post.id]"
                type="text"
                placeholder="写下你的评论..."
                @keyup.enter="addComment(post.id)"
              >
              <button @click="addComment(post.id)" class="comment-submit">发表</button>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
              <div 
                v-for="comment in post.comments" 
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <img :src="comment.user.avatar" :alt="comment.user.name" class="comment-avatar">
                  <div class="comment-info">
                    <span class="comment-user">{{ comment.user.name }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                </div>
                <div class="comment-content">
                  <p>{{ comment.content }}</p>
                </div>
                
                <!-- 回复按钮 -->
                <div class="comment-actions">
                  <button @click="toggleReply(comment.id)" class="reply-btn">
                    回复
                  </button>
                </div>

                <!-- 回复表单 -->
                <div v-if="comment.showReply" class="reply-form">
                  <input 
                    v-model="replyTexts[comment.id]"
                    type="text"
                    :placeholder="`回复 ${comment.user.name}:`"
                    @keyup.enter="addReply(comment.id)"
                  >
                  <button @click="addReply(comment.id)" class="reply-submit">回复</button>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies.length > 0" class="replies-list">
                  <div 
                    v-for="reply in comment.replies" 
                    :key="reply.id"
                    class="reply-item"
                  >
                    <div class="reply-header">
                      <img :src="reply.user.avatar" :alt="reply.user.name" class="reply-avatar">
                      <span class="reply-user">{{ reply.user.name }}</span>
                      <span class="reply-to">回复</span>
                      <span class="reply-target">{{ reply.replyTo.name }}</span>
                      <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                    </div>
                    <div class="reply-content">
                      <p>{{ reply.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
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

    <!-- 通知列表组件 -->
    <NotificationList 
      :visible="showNotifications"
      @close="handleNotificationClose"
      @unread-count-updated="handleUnreadCountUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth.js'
import { login, register, logout as authLogout } from '../api/auth.js'
import { getCurrentUserInfo } from '../api/user.js'
import { getPosts, createPost, likePost, unlikePost, deletePost } from '../api/posts.js'
import { getPostComments, createComment, likeComment, unlikeComment } from '../api/comments.js'
import { getUnreadNotificationCount } from '../api/notifications.js'
import { ElMessage, ElLoading } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import NotificationList from '../component/NotificationList.vue'
import '../style/header.css'
import { getFullImageUrl, processImageUrls } from '../config/index.js'

// 使用认证状态管理
const { isLoggedIn, currentUser, userDisplayName, userAvatar, updateUserInfo, updateAuthState, clearAuthState } = useAuth()

// 使用路由
const router = useRouter()

// 状态管理
const activeMenu = ref('5')
const activeTab = ref('login')
const showPostForm = ref(false)
const showImageViewer = ref(false)
const currentViewImage = ref('')
const viewerImages = ref([])
const currentImageIndex = ref(0)
const isLoading = ref(false)

// 通知相关状态
const unreadCount = ref(0)
const showNotifications = ref(false)
const notificationPollingInterval = ref(null)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证状态
const loginErrors = ref({})
const registerErrors = ref({})

// 新动态数据
const newPost = reactive({
  content: '',
  images: []
})

// 评论和回复文本
const commentTexts = ref({})
const replyTexts = ref({})

// 图片上传引用
const imageInput = ref(null)
const postRefs = reactive({})
const backgroundRef = ref(null)

// 动态数据
const posts = ref([])

// 计算属性
const canPublish = computed(() => {
  return newPost.content.trim().length > 0 || newPost.images.length > 0
})

// 表单验证方法
const validateLoginForm = () => {
  const errors = {}
  
  if (!loginForm.username.trim()) {
    errors.username = '用户名不能为空'
  }
  
  if (!loginForm.password.trim()) {
    errors.password = '密码不能为空'
  } else if (loginForm.password.length < 6) {
    errors.password = '密码长度不能少于6位'
  }
  
  loginErrors.value = errors
  return Object.keys(errors).length === 0
}

const validateRegisterForm = () => {
  const errors = {}
  
  if (!registerForm.username.trim()) {
    errors.username = '用户名不能为空'
  } else if (registerForm.username.length < 3) {
    errors.username = '用户名长度不能少于3位'
  }
  
  if (!registerForm.email.trim()) {
    errors.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.email = '邮箱格式不正确'
  }
  
  if (!registerForm.password.trim()) {
    errors.password = '密码不能为空'
  } else if (registerForm.password.length < 6) {
    errors.password = '密码长度不能少于6位'
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
  }
  
  registerErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleLogin = async () => {
  if (!validateLoginForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await login({
      username: loginForm.username.trim(),
      password: loginForm.password
    })
    
    // 更新认证状态
    updateAuthState(true, response.user)
    
    ElMessage.success('登录成功！欢迎回到卧云社区')
    
    // 清空表单
    loginForm.username = ''
    loginForm.password = ''
    loginErrors.value = {}
    
    // 登录成功后，isLoggedIn 会自动变为 true，触发 watch
    // 这将自动显示社区主页内容并加载用户数据
    
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请检查用户名和密码')
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!validateRegisterForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    // 注意：这里我们不希望注册后自动登录，所以需要特殊处理
    // 保存当前 localStorage 状态
    const currentToken = localStorage.getItem('woyun_token')
    const currentUser = localStorage.getItem('woyun_user')
    
    const response = await register({
      username: registerForm.username.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password
    })
    
    // 注册成功后清除自动保存的 token 和 user
    localStorage.removeItem('woyun_token')
    localStorage.removeItem('woyun_user')
    
    // 恢复之前的状态（如果存在）
    if (currentToken) localStorage.setItem('woyun_token', currentToken)
    if (currentUser) localStorage.setItem('woyun_user', currentUser)
    
    ElMessage.success('注册成功！请登录您的账户')
    
    // 清空表单
    Object.keys(registerForm).forEach(key => {
      registerForm[key] = ''
    })
    registerErrors.value = {}
    
    // 注册成功后跳转到登录标签页
    activeTab.value = 'login'
    
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const logout = async () => {
  try {
    await authLogout()
    
    // 清除认证状态
    clearAuthState()
    
    ElMessage.success('退出登录成功')
    showPostForm.value = false
    
    // 清空动态数据
    posts.value = []
    
  } catch (error) {
    console.error('登出失败:', error)
    ElMessage.error('登出失败，请稍后重试')
  }
}

// 加载用户相关数据
const loadUserPosts = async () => {
  if (!isLoggedIn.value) {
    return
  }
  
  try {
    // 加载当前用户信息
    const userInfo = await getCurrentUserInfo()
    
    // 更新全局用户状态
    updateUserInfo(userInfo)
    
    // TODO: 调用后端 API 获取动态列表
    // const postsData = await http.get('/api/posts')
    // posts.value = postsData.content || postsData
    
    // 加载社区动态列表
    await loadCommunityPosts()
    
    console.log('用户信息加载成功:', userInfo)
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
  }
}

// 加载社区动态列表
const loadCommunityPosts = async (page = 0, size = 10) => {
  try {
    console.log('加载社区动态:', { page, size })
    
    const postsData = await getPosts({ page, size })
    
    // 处理动态数据
    const processedPosts = (postsData.content || postsData || []).map(post => {
      // 处理作者头像 - 使用统一的图片URL处理函数
      const fullAvatarUrl = getFullImageUrl(post.author?.avatarUrl)
      
      // 处理动态图片 - 使用统一的图片URL处理函数
      const processedImages = processImageUrls(post.imageUrls || [])
      
      return {
        id: post.id,
        content: post.content,
        images: processedImages,
        user: {
          id: post.author?.id,
          name: post.author?.name || post.author?.username,
          avatar: fullAvatarUrl
        },
        likes: post.likeCount || 0,
        isLiked: post.isLiked || false,
        createdAt: new Date(post.createdAt),
        showComments: false,
        showFullText: false,
        comments: [], // 初始为空，点击时加载
        commentCount: post.commentCount || 0
      }
    })
    
    if (page === 0) {
      // 首次加载或刷新
      posts.value = processedPosts
    } else {
      // 分页加载，添加到末尾
      posts.value.push(...processedPosts)
    }
    
    console.log('社区动态加载成功:', processedPosts.length, '条')
    
  } catch (error) {
    console.error('加载社区动态失败:', error)
    ElMessage.error('加载动态失败')
  }
}

// 监听登录状态变化
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    // 登录成功后加载相关数据
    await loadUserPosts()
    // 启动通知轮询
    startNotificationPolling()
  } else {
    // 登出后清空数据
    posts.value = []
    unreadCount.value = 0
    // 停止通知轮询
    stopNotificationPolling()
  }
})

const goToUserProfile = () => {
  // 使用 Vue Router 跳转到当前用户的个人主页
  if (currentUser.value?.id) {
    router.push(`/user/${currentUser.value.id}`)
  }
}

const togglePostForm = () => {
  showPostForm.value = !showPostForm.value
  if (!showPostForm.value) {
    // 清空表单
    newPost.content = ''
    newPost.images = []
  }
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  const remainingSlots = 6 - newPost.images.length
  const filesToProcess = files.slice(0, remainingSlots)
  
  filesToProcess.forEach(file => {
    if (file.type.startsWith('image/')) {
      // 验证文件是真正的File对象
      console.log('🖼️ 图片文件信息:', {
        name: file.name,
        type: file.type,
        size: file.size,
        isFile: file instanceof File,
        constructor: file.constructor.name
      })
      
      const reader = new FileReader()
      reader.onload = (e) => {
        newPost.images.push({
          file: file, // 确保存储的是原始File对象
          url: e.target.result
        })
        
        console.log('✅ 图片添加成功，当前图片数:', newPost.images.length)
      }
      reader.readAsDataURL(file)
    }
  })
  
  // 清空input
  event.target.value = ''
}

const removeImage = (index) => {
  newPost.images.splice(index, 1)
}

const publishPost = async () => {
  if (!canPublish.value) return
  
  const loadingInstance = ElLoading.service({
    text: '正在发布动态...'
  })
  
  try {
    // 准备发布数据
    const postData = {
      content: newPost.content.trim()
    }
    
    // 准备图片文件 - 确保是File对象
    const imageFiles = newPost.images
      .map(img => img.file)
      .filter(file => file instanceof File) // 确保只有真正的File对象
    
    // 添加详细调试信息
    console.log('📋 发布动态调试信息:', {
      postData,
      imagesCount: newPost.images.length,
      imageFilesCount: imageFiles.length,
      imagesStructure: newPost.images.map((img, index) => ({
        index,
        hasFile: !!img.file,
        fileType: img.file ? img.file.constructor.name : 'null',
        fileName: img.file ? img.file.name : 'null',
        fileSize: img.file ? img.file.size : 'null',
        isFileInstance: img.file instanceof File,
        url: img.url ? img.url.substring(0, 50) + '...' : 'null'
      })),
      validFiles: imageFiles.map((file, index) => ({
        index,
        name: file.name,
        type: file.type,
        size: file.size,
        isFile: file instanceof File,
        constructor: file.constructor.name
      }))
    })
    
    console.log('发布动态:', postData, '图片数量:', imageFiles.length)
    
    // 调用API发布动态
    const newPostItem = await createPost(postData, imageFiles)
    
    console.log('动态发布成功:', newPostItem)
    
    // 处理返回的动态数据 - 使用统一的图片URL处理函数
    const fullAuthorAvatar = getFullImageUrl(newPostItem.author?.avatarUrl)
    
    const processedPost = {
      id: newPostItem.id,
      content: newPostItem.content,
      images: processImageUrls(newPostItem.imageUrls || []),
      user: {
        id: newPostItem.author?.id,
        name: newPostItem.author?.name || newPostItem.author?.username,
        avatar: fullAuthorAvatar
      },
      likes: newPostItem.likeCount || 0,
      isLiked: newPostItem.isLiked || false,
      createdAt: new Date(newPostItem.createdAt),
      showComments: false,
      showFullText: false,
      comments: [],
      commentCount: newPostItem.commentCount || 0
    }
    
    // 添加到动态列表顶部
    posts.value.unshift(processedPost)
    
    // 清空表单
    newPost.content = ''
    newPost.images = []
    showPostForm.value = false
    
    ElMessage.success('动态发布成功！')
    
  } catch (error) {
    console.error('发布动态失败:', error)
    ElMessage.error(error.message || '发布动态失败')
  } finally {
    loadingInstance.close()
  }
}

const toggleLike = async (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return
  
  try {
    if (post.isLiked) {
      // 取消点赞
      const result = await unlikePost(postId)
      post.likes = result.likeCount
      post.isLiked = false
    } else {
      // 点赞
      const result = await likePost(postId)
      post.likes = result.likeCount
      post.isLiked = true
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('点赞操作失败')
  }
}

const toggleComments = async (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return
  
  post.showComments = !post.showComments
  
  // 如果打开评论且还没有加载过评论，则加载
  if (post.showComments && post.comments.length === 0 && post.commentCount > 0) {
    await loadPostComments(postId)
  }
}

// 加载动态的评论列表
const loadPostComments = async (postId) => {
  try {
    const commentsData = await getPostComments(postId, { page: 0, size: 20 })
    
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      // 处理评论数据，确保正确提取content字段
      const rawData = commentsData.data || commentsData
      const commentsList = rawData.content || rawData || []
      
      const processedComments = commentsList.map(comment => {
        // 使用统一的图片URL处理函数
        const fullAvatarUrl = getFullImageUrl(comment.author?.avatarUrl)
        
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
          replies: comment.replies || []
        }
      })
      
      post.comments = processedComments
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
  }
}

const addComment = async (postId) => {
  const content = commentTexts.value[postId]?.trim()
  if (!content) return
  
  try {
    const commentData = { content }
    
    // 调用API发表评论
    const newComment = await createComment(postId, commentData)
    
    const post = posts.value.find(p => p.id === postId)
    if (post) {
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
      
      post.comments.push(processedComment)
      post.commentCount++
      commentTexts.value[postId] = ''
    }
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败')
  }
}

const toggleReply = (commentId) => {
  posts.value.forEach(post => {
    post.comments.forEach(comment => {
      if (comment.id === commentId) {
        comment.showReply = !comment.showReply
      }
    })
  })
}

const addReply = (commentId) => {
  const content = replyTexts.value[commentId]?.trim()
  if (!content) return
  
  posts.value.forEach(post => {
    const comment = post.comments.find(c => c.id === commentId)
    if (comment) {
      const newReply = {
        id: Date.now(),
        user: { ...currentUser.value },
        replyTo: { ...comment.user },
        content: content,
        createdAt: new Date()
      }
      
      comment.replies.push(newReply)
      replyTexts.value[commentId] = ''
      comment.showReply = false
      
      // TODO: 调用后端API添加回复
    }
  })
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

const getTruncatedText = (text) => {
  return text.length > 100 ? text.substring(0, 100) : text
}

const toggleFullText = (postId) => {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.showFullText = !post.showFullText
  }
}

const viewPostDetail = (postId) => {
  // 使用 Vue Router 跳转到动态详情页面
  router.push(`/community/post/${postId}`)
}

// 跳转到用户个人主页
const viewUserProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

// 通知相关方法
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const handleNotificationClose = () => {
  showNotifications.value = false
}

const handleUnreadCountUpdated = (newCount) => {
  unreadCount.value = newCount
}

const loadUnreadNotificationCount = async () => {
  try {
    const response = await getUnreadNotificationCount()
    unreadCount.value = response.data || 0
  } catch (error) {
    console.error('获取未读通知数量失败:', error)
    // 静默失败，不显示错误消息
  }
}

const startNotificationPolling = () => {
  // 立即获取一次未读数量
  loadUnreadNotificationCount()
  
  // 每30秒轮询一次
  notificationPollingInterval.value = setInterval(() => {
    loadUnreadNotificationCount()
  }, 30000)
}

const stopNotificationPolling = () => {
  if (notificationPollingInterval.value) {
    clearInterval(notificationPollingInterval.value)
    notificationPollingInterval.value = null
  }
}

const handleMenuSelect = (key) => {
  activeMenu.value = key
  if (key === '1') {
    router.push('/')
  } else if (key === '2-1') {
    router.push('/team-history')
  } else if (key === '2-2') {
    router.push('/team-member')
  } else if (key === '3') {
    router.push('/routes')
  } else if (key === '4') {
    // 活动动态功能正在开发中
    ElMessage.info('这个页面认不得咋个做')
  } else if (key === '5') {
    router.push('/community')
  } else if (key === '6') {
    router.push('/contact')
  }
}

// 生命周期
onMounted(() => {
  // 初始化页面
  console.log('卧云社区页面加载完成')
  
  // 背景渐显动画
  if (backgroundRef.value) {
    backgroundRef.value.classList.add('background-fade-in')
  }
  
  // 如果已经登录，加载相关数据
  if (isLoggedIn.value) {
    loadUserPosts().then(() => {
      // 数据加载完成后初始化动画观察器
      setTimeout(() => {
        observeElements()
      }, 100)
    })
    // 启动通知轮询
    startNotificationPolling()
  } else {
    // 未登录时也要初始化动画观察器
    setTimeout(() => {
      observeElements()
    }, 100)
  }
})

// 滚动动画观察器
const observeElements = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-active')
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  )

  // 观察动态卡片
  nextTick(() => {
    const postElements = document.querySelectorAll('.post-item')
    postElements.forEach((el) => {
      if (el) {
        observer.observe(el)
      }
    })
  })
}
</script>

<style scoped>
@import '../style/community.css';
</style>