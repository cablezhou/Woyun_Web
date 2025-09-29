<template>
  <div class="user-profile">
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
    <div class="user-profile-background" ref="backgroundRef"></div>

    <div class="user-profile-container">
      <!-- 返回导航 -->
      <div class="back-nav">
        <button @click="goBack" class="back-btn">
          ← 返回社区
        </button>
      </div>

      <!-- 用户信息卡片 -->
      <div class="user-info-card" ref="userInfoRef">
        <div class="user-info-header">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="user-avatar-large" @click="editAvatar">
              <img :src="computedAvatarUrl" :alt="userProfile.name">
              <div class="avatar-edit-overlay" v-if="isCurrentUser">
                <div class="edit-icon">✏️</div>
                <div>编辑头像</div>
              </div>
            </div>
            <input 
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarUpload"
            >
          </div>

          <!-- 用户基本信息 -->
          <div class="user-basic-info">
            <!-- 姓名编辑 -->
            <div class="name-edit-section">
              <div v-if="!editingName || !isCurrentUser" class="user-name" @click="isCurrentUser ? startEditName() : null">
                {{ userProfile.name }}
                <span class="edit-hint" v-if="isCurrentUser">点击编辑</span>
              </div>
              <div v-else-if="isCurrentUser" class="name-edit-form">
                <input 
                  ref="nameInput"
                  v-model="editNameValue"
                  class="name-input"
                  @blur="saveName"
                  @keyup.enter="saveName"
                  @keyup.esc="editingName = false"
                >
              </div>
            </div>

            <!-- 队内title编辑 -->
            <div class="title-edit-section">
              <div v-if="!editingTitle || !isCurrentUser" class="user-title" @click="isCurrentUser ? startEditTitle() : null">
                {{ userProfile.title || '暂无头衔' }}
                <span class="edit-hint" v-if="isCurrentUser">点击编辑</span>
              </div>
              <div v-else-if="isCurrentUser" class="title-edit-form">
                <input 
                  ref="titleInput"
                  v-model="editTitleValue"
                  class="title-input"
                  @blur="saveTitle"
                  @keyup.enter="saveTitle"
                  @keyup.esc="editingTitle = false"
                >
              </div>
            </div>

            <!-- 用户统计 -->
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ userProfile.stats?.postsCount || 0 }}</span>
                <span class="stat-label">动态</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userProfile.stats?.totalLikesReceived || 0 }}</span>
                <span class="stat-label">获赞</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userProfile.stats?.daysAsMember || 0 }}</span>
                <span class="stat-label">加入天数</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 相册区域 -->
      <div class="photo-gallery-section" ref="galleryRef">
        <div class="section-header">
          <h2>个人相册</h2>
          <button v-if="isCurrentUser" @click="addPhotos" class="add-photos-btn">
            + 添加照片
          </button>
          <input 
            ref="photosInput"
            type="file"
            multiple
            accept="image/*"
            style="display: none"
            @change="handlePhotosUpload"
          >
        </div>
        
        <div class="photo-gallery">
          <div 
            v-for="(photo, index) in computedPhotos" 
            :key="photo.id || index"
            class="photo-item"
            @click="viewPhoto(photo, computedPhotos, index)"
          >
            <img :src="photo.photoUrl" :alt="`相册照片 ${index + 1}`">
            <div class="photo-overlay" v-if="isCurrentUser">
              <button @click.stop="deletePhoto(index)" class="delete-photo-btn">×</button>
            </div>
          </div>
          
          <div v-if="computedPhotos.length === 0" class="empty-gallery">
            <div>暂无照片</div>
            <button v-if="isCurrentUser" @click="addPhotos" class="upload-first-btn">
              上传第一张照片
            </button>
          </div>
        </div>
      </div>

      <!-- 用户创建的路线区域 -->
      <div class="user-routes-section" ref="routesRef">
        <div class="section-header">
          <h2>个人路线</h2>
          <button v-if="isCurrentUser" @click="refreshRoutes" class="add-photos-btn">
            🔄 刷新
          </button>
        </div>
        
        <div class="routes-grid">
          <div 
            v-for="route in userRoutes" 
            :key="route.id"
            class="route-card"
            @click="viewRouteDetail(route.id)"
          >
            <!-- 路线缩略图 -->
            <div class="route-thumbnail">
              <img :src="route.thumbnail" :alt="route.title" loading="lazy">
              <div class="route-overlay">
                <div class="route-difficulty" :class="route.difficulty">
                  {{ getDifficultyText(route.difficulty) }}
                </div>
              </div>
            </div>
            
            <!-- 路线信息 -->
            <div class="route-info">
              <h3 class="route-title">{{ route.title }}</h3>
              <p class="route-description">{{ route.description }}</p>
              
              <div class="route-metadata">
                <div class="metadata-item">
                  <span class="icon">📏</span>
                  <span>{{ route.distance }} km</span>
                </div>
                <div class="metadata-item">
                  <span class="icon">⛰️</span>
                  <span>{{ route.elevation }} m</span>
                </div>
              </div>
              
              <!-- 添加下载GPX按钮 -->
              <div class="route-actions">
                <button @click.stop="downloadRouteGPX(route)" class="action-btn download-btn">
                  📥 下载GPX
                </button>
                <button v-if="isCurrentUser" @click.stop="editRoute(route)" class="action-btn edit-btn">
                  ✏️ 编辑
                </button>
                <button v-if="isCurrentUser" @click.stop="removeRoute(route.id)" class="action-btn delete-btn">
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="userRoutes.length === 0" class="empty-routes">
            <div>暂无创建的路线</div>
          </div>
        </div>
      </div>

      <!-- 动态列表区域 -->
      <div class="user-posts-section" ref="postsRef">
        <div class="section-header">
          <h2>个人动态</h2>
        </div>
        
        <div class="posts-list">
          <div 
            v-for="post in userPosts" 
            :key="post.id"
            class="post-item"
            :ref="el => { if (el) postRefs[post.id] = el }"
          >
            <!-- 动态头部 -->
            <div class="post-header">
              <div class="post-user">
                <img :src="post.user.avatar" :alt="post.user.name" class="user-avatar-small">
                <div class="user-info-small">
                  <h4>{{ post.user.name }}</h4>
                  <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                </div>
              </div>
              
              <div class="post-actions-menu" v-if="isCurrentUser">
                <button @click="editPost(post.id)" class="action-menu-btn">编辑</button>
                <button @click="deletePost(post.id)" class="action-menu-btn delete">删除</button>
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
                <button @click="goToPostDetail(post.id)" class="detail-btn">
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
            </div>
          </div>
          
          <div v-if="userPosts.length === 0" class="empty-posts">
            <div>暂无动态</div>
            <button @click="goToCommunity" class="go-post-btn">
              去社区发布动态
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <div v-if="showImageViewer" class="image-viewer" @click="closeImageViewer">
      <div class="viewer-content" @click.stop>
        <img :src="currentViewImage" :alt="`查看图片`">
        <button @click="closeImageViewer" class="close-viewer">×</button>
        <button v-if="viewerImages.length > 1" @click="prevImage" class="nav-btn prev-btn">‹</button>
        <button v-if="viewerImages.length > 1" @click="nextImage" class="nav-btn next-btn">›</button>
      </div>
    </div>

    <!-- 路线编辑对话框 -->
    <el-dialog
      v-model="showRouteEditDialog"
      title="编辑路线"
      width="500px"
    >
      <el-form
        ref="routeEditFormRef"
        :model="routeEditForm"
        :rules="routeEditFormRules"
        label-width="80px"
      >
        <el-form-item label="路线标题" prop="title">
          <el-input v-model="routeEditForm.title" placeholder="请输入路线标题" />
        </el-form-item>
        
        <el-form-item label="路线描述" prop="description">
          <el-input 
            v-model="routeEditForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入路线描述"
          />
        </el-form-item>
        
        <el-form-item label="难度等级" prop="difficulty">
          <el-select v-model="routeEditForm.difficulty" placeholder="请选择难度等级">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="路线类型" prop="routeType">
          <el-select v-model="routeEditForm.routeType" placeholder="请选择路线类型">
            <el-option label="山地" value="mountain" />
            <el-option label="公路" value="road" />
            <el-option label="城市" value="city" />
            <el-option label="风景" value="scenic" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRouteEditDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitRouteEdit" 
            :loading="isRouteEditing"
          >
            {{ isRouteEditing ? '保存中...' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../stores/auth.js'
import { 
  getCurrentUserInfo, 
  getUserInfo, 
  updateUserInfo, 
  uploadAvatar, 
  getUserPhotos, 
  uploadPhotos, 
  deletePhoto as deletePhotoAPI,
  getUserPosts
} from '../api/user.js'
import { getUserRoutes, updateRoute, deleteRoute as deleteRouteAPI } from '../api/routes.js'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import '../style/header.css'
import { getFullImageUrl, processImageUrls } from '../config/index.js'
import { loadImageWithHeaders, loadImagesWithHeaders } from '../utils/imageLoader.js'

const route = useRoute()
const router = useRouter()
const { currentUser, updateUserInfo: updateAuthUserInfo } = useAuth()
const activeMenu = ref('4') // 个人主页应该对应"活动动态"菜单项

// 监听currentUser变化，确保导航正确
watch(
  () => currentUser.value,
  (newUser) => {
    if (!newUser && route.name === 'userProfile') {
      // 如果用户未登录但试图访问个人主页，重定向到社区
      router.push('/community').catch(err => {
        console.warn('路由跳转失败:', err)
      })
    }
  },
  { immediate: true }
)

// 状态管理
const showImageViewer = ref(false)
const currentViewImage = ref('')
const viewerImages = ref([])
const currentImageIndex = ref(0)
const editingName = ref(false)
const editingTitle = ref(false)
const editNameValue = ref('')
const editTitleValue = ref('')
const isLoading = ref(true)
const isUploading = ref(false)
const isCurrentUser = computed(() => {
  const routeUserId = parseInt(route.params.id)
  return routeUserId === currentUser.value?.id
})

// 路线编辑相关
const showRouteEditDialog = ref(false)
const isRouteEditing = ref(false)
const currentEditingRouteId = ref(null)
const routeEditFormRef = ref(null)

const routeEditForm = reactive({
  title: '',
  description: '',
  difficulty: '',
  routeType: ''
})

const routeEditFormRules = {
  title: [
    { required: true, message: '请输入路线标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入路线描述', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  routeType: [
    { required: true, message: '请选择路线类型', trigger: 'change' }
  ]
}

// 计算属性：处理头像 URL
const computedAvatarUrl = computed(() => {
  return getFullImageUrl(userProfile.value.avatarUrl)
})

// 计算属性：处理相册照片 URL
const computedPhotos = computed(() => {
  return userProfile.value.photos.map(photo => {
    const photoUrl = photo.photoUrl || photo.url
    const fullUrl = getFullImageUrl(photoUrl)
    
    return {
      ...photo,
      photoUrl: fullUrl,
      url: fullUrl
    }
  })
})

// DOM引用
const backgroundRef = ref(null)
const userInfoRef = ref(null)
const galleryRef = ref(null)
const postsRef = ref(null)
const routesRef = ref(null)  // 添加路线区域引用
const postRefs = reactive({})
const avatarInput = ref(null)
const photosInput = ref(null)
const nameInput = ref(null)
const titleInput = ref(null)

// 用户资料数据
const userProfile = ref({
  id: null,
  name: '',
  title: '',
  bio: '',
  avatar: '',
  joinDate: '',
  stats: {
    postsCount: 0,
    totalLikesReceived: 0,
    daysAsMember: 0
  },
  photos: [],
  photoAlbumPreview: []
})

// 用户动态数据
const userPosts = ref([])

// 用户路线数据
const userRoutes = ref([])

// 加载用户信息
const loadUserProfile = async () => {
  try {
    isLoading.value = true
    const userId = parseInt(route.params.id)
    
    let userInfo
    if (isCurrentUser.value) {
      // 获取当前用户的完整信息
      userInfo = await getCurrentUserInfo()
    } else {
      // 获取指定用户的公开信息
      userInfo = await getUserInfo(userId)
    }
    
    userProfile.value = {
      ...userInfo,
      stats: {
        postsCount: userInfo.postCount || 0,
        totalLikesReceived: userInfo.totalLikesReceived || 0,
        daysAsMember: userInfo.daysAsMember || 0
      },
      photos: userInfo.photoAlbumPreview || []
    }
    
    console.log('用户信息加载成功:', userProfile.value)
    
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    isLoading.value = false
  }
}

// 加载用户路线
const loadUserRoutes = async () => {
  try {
    // 确保有用户ID
    const userId = parseInt(route.params.id)
    if (!userId) {
      console.warn('无法加载用户路线：无效的用户ID')
      return
    }
    
    console.log('🔍 加载用户路线，用户ID:', userId)
    const routesData = await getUserRoutes(userId, { page: 0, size: 10 })
    console.log('📨 用户路线响应:', routesData)
    
    // 处理路线数据
    // 根据API文档，响应格式为 {code: 200, message: "操作成功", data: {...}}
    // 我们需要提取data字段，然后再处理content
    const responseData = routesData.data || routesData
    let rawRoutes = responseData.content || responseData || []
    console.log('📋 提取的路线列表:', rawRoutes)
    
    // 处理路线数据格式 - 使用后端生成的缩略图
    const processedRoutes = rawRoutes.map(route => {
      // 处理缩略图URL，优先使用thumbnailUrl（后端生成的缩略图）
      let thumbnail = '/imagines/Background2.jpg'
      if (route.thumbnailUrl) {
        // 使用后端生成的缩略图 - 使用统一的图片URL处理函数
        thumbnail = getFullImageUrl(route.thumbnailUrl)
      } else if (route.thumbnail) {
        // 兼容旧的thumbnail字段 - 使用统一的图片URL处理函数
        thumbnail = getFullImageUrl(route.thumbnail)
      }
      
      console.log('🖼️ 路线缩略图URL:', thumbnail)
      
      return {
        id: route.id,
        title: route.title,
        description: route.description,
        distance: route.distance,
        elevation: route.elevationGain || route.elevation || 0,
        estimatedTime: route.estimatedTime || '未知',
        difficulty: route.difficulty || 'medium',
        type: route.routeType || route.type || 'scenic', // 注意是routeType而不是type
        thumbnail: thumbnail,
        gpxFileUrl: route.gpxFileUrl || '', // 添加gpxFileUrl字段
        createdAt: new Date(route.createdAt)
      }
    })
    
    userRoutes.value = processedRoutes
    
    console.log('✅ 用户路线加载成功:', processedRoutes.length, '条')
    
  } catch (error) {
    console.error('❌ 加载用户路线失败:', error)
    // 不显示错误，因为路线功能可能还未完全实现
  }
}

// 刷新用户路线
const refreshRoutes = async () => {
  await loadUserRoutes()
  ElMessage.success('路线列表已刷新')
}

// 编辑路线
const editRoute = (route) => {
  // 设置当前编辑的路线ID
  currentEditingRouteId.value = route.id
  
  // 填充表单数据
  routeEditForm.title = route.title
  routeEditForm.description = route.description
  routeEditForm.difficulty = route.difficulty
  routeEditForm.routeType = route.type
  
  // 显示编辑对话框
  showRouteEditDialog.value = true
}

// 提交路线编辑
const submitRouteEdit = async () => {
  if (!routeEditFormRef.value) return
  
  await routeEditFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请填写所有必填项')
      return
    }
    
    try {
      isRouteEditing.value = true
      
      // 准备更新数据
      const updateData = {
        title: routeEditForm.title,
        description: routeEditForm.description,
        difficulty: routeEditForm.difficulty,
        routeType: routeEditForm.routeType
      }
      
      // 调用API更新路线
      const updatedRoute = await updateRoute(currentEditingRouteId.value, updateData)
      
      // 更新本地数据
      const routeIndex = userRoutes.value.findIndex(r => r.id === currentEditingRouteId.value)
      if (routeIndex !== -1) {
        userRoutes.value[routeIndex] = {
          ...userRoutes.value[routeIndex],
          title: updatedRoute.title,
          description: updatedRoute.description,
          difficulty: updatedRoute.difficulty,
          type: updatedRoute.routeType || updatedRoute.type
        }
      }
      
      // 关闭对话框
      showRouteEditDialog.value = false
      
      ElMessage.success('路线更新成功')
      
    } catch (error) {
      console.error('更新路线失败:', error)
      ElMessage.error('更新路线失败: ' + (error.message || '未知错误'))
    } finally {
      isRouteEditing.value = false
    }
  })
}

// 删除路线
const deleteRouteConfirm = async (routeId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条路线吗？此操作不可撤销。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用API删除路线
    await deleteRouteAPI(routeId)
    
    // 从本地数据中移除
    const routeIndex = userRoutes.value.findIndex(r => r.id === routeId)
    if (routeIndex !== -1) {
      userRoutes.value.splice(routeIndex, 1)
    }
    
    ElMessage.success('路线删除成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除路线失败:', error)
      ElMessage.error('删除路线失败: ' + (error.message || '未知错误'))
    }
  }
}

// 加载用户动态
const loadUserPosts = async () => {
  try {
    const userId = parseInt(route.params.id)
    console.log('🔍 加载用户动态，用户ID:', userId)
    
    const postsData = await getUserPosts(userId, { page: 0, size: 20 })
    console.log('📨 原始动态数据:', postsData)
    
    // 处理分页数据和数据格式
    // 根据API文档，响应格式为 {code: 200, message: "操作成功", data: {...}}
    // 我们需要提取data字段，然后再处理content
    const responseData = postsData.data || postsData
    let rawPosts = responseData.content || responseData || []
    console.log('📋 提取的动态列表:', rawPosts)
    
    // 处理动态数据格式，确保与社区页面一致
    const processedPosts = rawPosts.map(post => {
      // 处理作者头像URL - 使用统一的图片URL处理函数
        const fullAuthorAvatar = getFullImageUrl(post.author?.avatarUrl || post.user?.avatar)
      
      // 处理动态图片URL
      const imageUrls = post.imageUrls || post.images || []
      const processedImages = processImageUrls(imageUrls)
      
      return {
        id: post.id,
        content: post.content,
        images: processedImages,
        user: {
          id: post.author?.id || post.user?.id,
          name: post.author?.name || post.author?.username || post.user?.name,
          avatar: fullAuthorAvatar
        },
        likes: post.likeCount || post.likes || 0,
        isLiked: post.isLiked || false,
        createdAt: new Date(post.createdAt),
        showComments: false,
        showFullText: false,
        comments: post.comments || [],
        commentCount: post.commentCount || (post.comments ? post.comments.length : 0)
      }
    })
    
    userPosts.value = processedPosts
    
    console.log('✅ 用户动态处理完成:', {
      原始数量: rawPosts.length,
      处理后数量: processedPosts.length,
      处理后数据: processedPosts
    })
    
    // 更新统计信息
    if (userProfile.value.stats) {
      userProfile.value.stats.postsCount = processedPosts.length
    }
    
  } catch (error) {
    console.error('❌ 加载用户动态失败:', error)
    ElMessage.error('加载动态失败')
  }
}

// 加载用户相册
const loadUserPhotos = async () => {
  try {
    const userId = parseInt(route.params.id)
    console.log('🔍 加载用户相册，用户ID:', userId)
    
    const photosData = await getUserPhotos(userId)
    console.log('📨 原始相册数据:', photosData)
    
    // 处理相册数据格式
    let rawPhotos = photosData.content || photosData || []
    console.log('📋 提取的相册列表:', rawPhotos)
    
    // 处理照片URL
    const processedPhotos = rawPhotos.map(photo => {
      const photoUrl = photo.photoUrl || photo.url
      const fullPhotoUrl = getFullImageUrl(photoUrl)
      
      return {
        ...photo,
        photoUrl: fullPhotoUrl,
        url: fullPhotoUrl
      }
    })
    
    userProfile.value.photos = processedPhotos
    
    console.log('✅ 用户相册处理完成:', {
      原始数量: rawPhotos.length,
      处理后数量: processedPhotos.length,
      处理后数据: processedPhotos
    })
    
  } catch (error) {
    console.error('❌ 加载用户相册失败:', error)
    ElMessage.error('加载相册失败')
  }
}

const handleMenuSelect = (key) => {
  activeMenu.value = key
  if (key === '1') {
    router.push('/')
  } else if (key === '2-2') {
    router.push('/team-member')
  } else if (key === '3') {
    router.push('/routes')
  } else if (key === '5') {
    router.push('/community')
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const goBack = () => {
  console.log('返回社区按钮被点击')
  router.push('/community').catch(err => {
    console.warn('路由跳转失败:', err)
  })
}

const goToCommunity = () => {
  console.log('去社区按钮被点击')
  router.push('/community').catch(err => {
    console.warn('路由跳转失败:', err)
  })
}

const goToPostDetail = (postId) => {
  router.push(`/community/post/${postId}`)
}

const viewRouteDetail = (routeId) => {
  router.push(`/routes/${routeId}`)
}

// 编辑用户信息
const editAvatar = () => {
  if (!isCurrentUser.value) {
    ElMessage.warning('只能编辑自己的头像')
    return
  }
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file || !file.type.startsWith('image/')) {
    ElMessage.error('请选择有效的图片文件')
    return
  }
  
  // 文件大小限制 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('头像文件大小不能超过5MB')
    return
  }
  
  // 检查登录状态和token
  const token = localStorage.getItem('woyun_token')
  const user = localStorage.getItem('woyun_user')
  
  console.log('🔍 上传前检查:', {
    hasToken: !!token,
    hasUser: !!user,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 30)}...` : 'NO_TOKEN',
    currentUser: currentUser.value
  })
  
  if (!token) {
    ElMessage.error('未登录或登录已过期，请重新登录')
    return
  }
  
  let loadingInstance = null
  
  try {
    isUploading.value = true
    loadingInstance = ElLoading.service({
      text: '正在上传头像...'
    })
    
    console.log('开始上传头像:', file.name, '大小:', (file.size / 1024 / 1024).toFixed(2) + 'MB')
    
    const result = await uploadAvatar(file)
    
    console.log('头像上传成功:', result)
    
    // 构建完整的图片URL - 使用统一的图片URL处理函数
    const avatarUrl = result.avatarUrl
    const fullAvatarUrl = getFullImageUrl(avatarUrl)
    
    console.log('更新头像 URL:', fullAvatarUrl)
    
    // 添加时间戳防止缓存
    const timestampedUrl = `${fullAvatarUrl}?t=${Date.now()}`
    
    // 更新本地显示
    userProfile.value.avatarUrl = timestampedUrl
    
    // 更新全局用户信息
    updateAuthUserInfo({ avatarUrl: timestampedUrl })
    
    ElMessage.success('头像更新成功')
    
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    // 确保关闭 Loading
    if (loadingInstance) {
      loadingInstance.close()
    }
    isUploading.value = false
    // 清空输入框
    if (event.target) {
      event.target.value = ''
    }
  }
}

const startEditName = () => {
  if (!isCurrentUser.value) {
    ElMessage.warning('只能编辑自己的信息')
    return
  }
  editingName.value = true
  editNameValue.value = userProfile.value.name
  nextTick(() => {
    nameInput.value?.focus()
  })
}

const saveName = async () => {
  if (!editNameValue.value.trim()) {
    editingName.value = false
    return
  }
  
  try {
    const updatedUser = await updateUserInfo({
      name: editNameValue.value.trim()
    })
    
    userProfile.value.name = updatedUser.name
    updateAuthUserInfo({ name: updatedUser.name })
    
    ElMessage.success('用户名更新成功')
  } catch (error) {
    console.error('更新用户名失败:', error)
    ElMessage.error(error.message || '更新用户名失败')
  } finally {
    editingName.value = false
  }
}

const startEditTitle = () => {
  if (!isCurrentUser.value) {
    ElMessage.warning('只能编辑自己的信息')
    return
  }
  editingTitle.value = true
  editTitleValue.value = userProfile.value.title
  nextTick(() => {
    titleInput.value?.focus()
  })
}

const saveTitle = async () => {
  if (!editTitleValue.value.trim()) {
    editingTitle.value = false
    return
  }
  
  try {
    const updatedUser = await updateUserInfo({
      title: editTitleValue.value.trim()
    })
    
    userProfile.value.title = updatedUser.title
    
    ElMessage.success('队内title更新成功')
  } catch (error) {
    console.error('更新队内title失败:', error)
    ElMessage.error(error.message || '更新title失败')
  } finally {
    editingTitle.value = false
  }
}

// 相册管理
const addPhotos = () => {
  if (!isCurrentUser.value) {
    ElMessage.warning('只能管理自己的相册')
    return
  }
  photosInput.value?.click()
}

const handlePhotosUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  // 验证文件类型和大小
  const validFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      ElMessage.warning(`文件 ${file.name} 不是有效的图片文件`)
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.warning(`文件 ${file.name} 大小超过10MB`)
      return false
    }
    return true
  })
  
  if (validFiles.length === 0) {
    event.target.value = ''
    return
  }
  
  let loadingInstance = null
  
  try {
    isUploading.value = true
    loadingInstance = ElLoading.service({
      text: `正在上传 ${validFiles.length} 张照片...`
    })
    
    console.log('开始上传照片:', validFiles.map(f => f.name))
    
    const uploadedPhotos = await uploadPhotos(validFiles)
    
    console.log('照片上传成功:', uploadedPhotos)
    
    // 处理上传的照片URL - 使用统一的图片URL处理函数
    const processedPhotos = uploadedPhotos.map(photo => {
      const photoUrl = photo.photoUrl || photo.url
      const fullPhotoUrl = getFullImageUrl(photoUrl)
      
      return {
        ...photo,
        photoUrl: fullPhotoUrl,
        url: fullPhotoUrl
      }
    })
    
    console.log('处理后的照片:', processedPhotos)
    
    // 更新本地显示
    userProfile.value.photos.unshift(...processedPhotos)
    
    ElMessage.success(`成功上传 ${uploadedPhotos.length} 张照片`)
    
  } catch (error) {
    console.error('照片上传失败:', error)
    ElMessage.error(error.message || '照片上传失败')
  } finally {
    // 确保关闭 Loading
    if (loadingInstance) {
      loadingInstance.close()
    }
    isUploading.value = false
    event.target.value = ''
  }
}

const deletePhoto = async (index) => {
  if (!isCurrentUser.value) {
    ElMessage.warning('只能删除自己的照片')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要删除这张照片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const photo = userProfile.value.photos[index]
    
    if (photo.id) {
      await deletePhotoAPI(photo.id)
    }
    
    userProfile.value.photos.splice(index, 1)
    ElMessage.success('照片删除成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除照片失败:', error)
      ElMessage.error(error.message || '删除照片失败')
    }
  }
}

const viewPhoto = (photo, photos, index) => {
  const photoUrl = photo.photoUrl || photo.url
  currentViewImage.value = photoUrl
  viewerImages.value = photos.map(p => p.photoUrl || p.url)
  currentImageIndex.value = index
  showImageViewer.value = true
}

// 动态管理
const editPost = (postId) => {
  // TODO: 实现编辑动态功能
  console.log('编辑动态:', postId)
  ElMessage.warning('这个功能我懒得做了，自己删掉重发[愉快]')
}

const deletePost = (postId) => {
  if (confirm('真呢要删掉噶？')) {
    const index = userPosts.value.findIndex(p => p.id === postId)
    if (index > -1) {
      userPosts.value.splice(index, 1)
      userProfile.value.stats.postsCount--
    }
    // TODO: 调用后端API删除动态
    console.log('删除动态:', postId)
  }
}

const toggleLike = (postId) => {
  const post = userPosts.value.find(p => p.id === postId)
  if (post) {
    if (post.isLiked) {
      post.likes--
      post.isLiked = false
    } else {
      post.likes++
      post.isLiked = true
    }
  }
  // TODO: 调用后端API更新点赞状态
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
  const post = userPosts.value.find(p => p.id === postId)
  if (post) {
    post.showFullText = !post.showFullText
  }
}

const getDifficultyText = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getTypeText = (type) => {
  const map = {
    mountain: '山地',
    road: '公路',
    city: '城市',
    scenic: '风景'
  }
  return map[type] || type
}

// 图片查看器相关函数
const closeImageViewer = () => {
  showImageViewer.value = false
  currentViewImage.value = ''
  viewerImages.value = []
  currentImageIndex.value = 0
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

  // 观察各个区域
  const elementsToObserve = [
    userInfoRef.value,
    galleryRef.value,
    postsRef.value,
    routesRef.value  // 添加路线区域
  ]
  
  elementsToObserve.forEach((el) => {
    if (el) {
      observer.observe(el)
    }
  })

  // 观察动态卡片
  Object.values(postRefs).forEach((el) => {
    if (el) {
      observer.observe(el)
    }
  })
  
  // 观察路线卡片
  nextTick(() => {
    const routeCards = document.querySelectorAll('.route-card')
    routeCards.forEach((card) => {
      observer.observe(card)
    })
  })
}

// 删除路线
const removeRoute = (routeId) => {
  deleteRouteConfirm(routeId)
}

// 下载路线GPX文件
const downloadRouteGPX = async (route) => {
  try {
    console.log('📥 下载GPX文件，路线:', route)
    
    // 检查是否有gpxFileUrl字段
    if (route.gpxFileUrl) {
      // 直接从gpxFileUrl下载文件 - 使用统一的URL处理函数
      const fullUrl = getFullImageUrl(route.gpxFileUrl)
      
      console.log('🔗 使用gpxFileUrl下载:', fullUrl)
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = fullUrl
      link.download = `${route.title}.gpx`
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      
      console.log('✅ GPX文件下载完成:', route.title)
      ElMessage.success('GPX文件下载成功')
    } else {
      console.log('🔄 gpxFileUrl字段不存在，尝试获取路线详情')
      
      try {
        // 导入getRouteDetail函数
        const { getRouteDetail } = await import('../api/routes.js')
        const routeDetail = await getRouteDetail(route.id)
        console.log('🔍 路线详情:', routeDetail)
        
        if (routeDetail.gpxFileUrl) {
          // 使用统一的URL处理函数
          const fullUrl = getFullImageUrl(routeDetail.gpxFileUrl)
          
          console.log('🔗 使用详情中的gpxFileUrl下载:', fullUrl)
          
          const link = document.createElement('a')
          link.href = fullUrl
          link.download = `${routeDetail.title || route.title}.gpx`
          document.body.appendChild(link)
          link.click()
          
          document.body.removeChild(link)
          
          console.log('✅ GPX文件下载完成:', routeDetail.title || route.title)
          ElMessage.success('GPX文件下载成功')
        } else {
          console.log('❌ 该路线没有可用的GPX文件')
          ElMessage.warning('该路线没有可用的GPX文件')
        }
      } catch (detailError) {
        console.error('❌ 获取路线详情失败:', detailError)
        ElMessage.error('获取路线详情失败: ' + (detailError.message || '未知错误'))
      }
    }
  } catch (error) {
    console.error('❌ 下载GPX文件失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 生命周期
onMounted(async () => {
  // 背景渐显动画
  if (backgroundRef.value) {
    backgroundRef.value.classList.add('background-fade-in')
  }
  
  // 加载用户数据
  await loadUserProfile()
  // 并行加载用户相册、动态和路线数据，但分别处理错误，避免一个失败影响其他
  await Promise.all([
    loadUserPhotos().catch(err => {
      console.error('加载用户相册失败:', err)
    }),
    loadUserPosts().catch(err => {
      console.error('加载用户动态失败:', err)
    }),
    loadUserRoutes().catch(err => {
      console.error('加载用户路线失败:', err)
    })
  ])
  
  // 延迟初始化动画观察器，确保DOM已渲染
  setTimeout(() => {
    observeElements()
  }, 500)
  
  console.log('个人主页加载完成')
})

</script>

<style scoped>
@import '../style/userProfile.css';
</style>
