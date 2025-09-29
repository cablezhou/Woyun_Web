<template>
  <div class="cycling-routes">
    <!-- 顶部导航 (复用) -->
    <el-header class="header">
      <div class="title">
        <img src="/imagines/logo.jpg" alt="卧云车队">
        <div class="divider">|</div>
        <div class="title-text">卧云车队</div>
      </div>
      <el-menu 
        mode="horizontal" 
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
    <div class="cycling-routes-background" ref="backgroundRef"></div>

    <div class="cycling-routes-container">
      <!-- 页面标题区域 -->
      <div class="page-header" ref="pageHeaderRef">
        <h1 class="page-title">骑行路线</h1>
        <p class="page-subtitle">昆明市热门路线 + 卧云车队成员已探索路线</p>
        <div class="header-actions">
          <button @click="uploadRoute" class="upload-btn">
            📁 上传路线
          </button>
          <input 
            ref="gpxInput" 
            type="file" 
            accept=".gpx,.kml,.tcx" 
            style="display: none" 
            @change="handleRouteUpload"
          >
        </div>
      </div>

      <!-- 路线创建表单对话框 -->
      <el-dialog
        v-model="showRouteForm"
        title="创建新路线"
        width="500px"
        :before-close="handleFormClose"
      >
        <el-form
          ref="routeFormRef"
          :model="routeForm"
          :rules="routeFormRules"
          label-width="80px"
        >
          <el-form-item label="路线标题" prop="title">
            <el-input v-model="routeForm.title" placeholder="请输入路线标题" />
          </el-form-item>
          
          <el-form-item label="路线描述" prop="description">
            <el-input 
              v-model="routeForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入路线描述"
            />
          </el-form-item>
          
          <el-form-item label="难度等级" prop="difficulty">
            <el-select v-model="routeForm.difficulty" placeholder="请选择难度等级">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="路线类型" prop="routeType">
            <el-select v-model="routeForm.routeType" placeholder="请选择路线类型">
              <el-option label="山地" value="mountain" />
              <el-option label="公路" value="road" />
              <el-option label="城市" value="city" />
              <el-option label="风景" value="scenic" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="GPX文件" prop="gpxFile">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="true"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              accept=".gpx"
            >
              <el-button type="primary">选择GPX文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传gpx文件，给听见了？
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelRouteForm">取消</el-button>
            <el-button type="primary" @click="submitRouteForm" :loading="isSubmitting">
              {{ isSubmitting ? '创建中...' : '创建路线' }}
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 路线筛选区域 -->
      <div class="route-filters" ref="filtersRef">
        <div class="filter-item">
          <label>难度等级：</label>
          <select v-model="filters.difficulty" @change="filterRoutes">
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
        <div class="filter-item">
          <label>距离范围：</label>
          <select v-model="filters.distance" @change="filterRoutes">
            <option value="">全部</option>
            <option value="0-20">0-20公里</option>
            <option value="20-50">20-50公里</option>
            <option value="50-100">50-100公里</option>
            <option value="100+">100公里以上</option>
          </select>
        </div>
        <div class="filter-item">
          <label>路线类型：</label>
          <select v-model="filters.type" @change="filterRoutes">
            <option value="">全部</option>
            <option value="mountain">山地</option>
            <option value="road">公路</option>
            <option value="city">城市</option>
            <option value="scenic">风景</option>
          </select>
        </div>
      </div>

      <!-- 路线统计 -->
      <div class="route-stats" ref="statsRef">
        <div class="stat-card">
          <div class="stat-number">{{ filteredRoutes.length }}</div>
          <div class="stat-label">条路线</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalDistance }}</div>
          <div class="stat-label">总里程(km)</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ averageDistance }}</div>
          <div class="stat-label">平均距离(km)</div>
        </div>
      </div>

      <!-- 路线列表 -->
      <div class="routes-grid" ref="routesGridRef">
        <div 
          v-for="route in filteredRoutes" 
          :key="route.id"
          class="route-card fade-in-up"
          :ref="el => { if (el) routeRefs[route.id] = el }"
          @click="viewRouteDetail(route.id)"
        >
          <!-- 路线缩略图 -->
          <div class="route-thumbnail">
            <!-- 加载状态 -->
            <div v-if="route.isGeneratingThumbnail" class="thumbnail-loading">
              <div class="loading-spinner"></div>
              <span>正在生成地图缩略图...</span>
            </div>
            
            <img 
              :src="route.thumbnail" 
              :alt="route.title" 
              loading="lazy"
              @load="handleImageLoad"
              @error="handleImageError"
              class="route-image fade-in"
              :class="{ 'generating': route.isGeneratingThumbnail }"
            >
            <div class="route-overlay">
              <div class="route-difficulty" :class="route.difficulty">
                {{ getDifficultyText(route.difficulty) }}
              </div>
              <div class="route-type">{{ getTypeText(route.type) }}</div>
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
              <div class="metadata-item">
                <span class="icon">⏱️</span>
                <span>{{ route.estimatedTime }}</span>
              </div>
            </div>
            
            <div class="route-actions">
              <button @click.stop="downloadGPXFile(route.id)" class="action-btn download-btn">
                📥 下载GPX
              </button>
              <button @click.stop="shareRoute(route.id)" class="action-btn share-btn">
                🔗 分享
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredRoutes.length === 0" class="empty-state">
        <div class="empty-icon">🗺️</div>
        <h3>暂无符合条件的路线</h3>
        <p>试试调整筛选条件或上传新的路线</p>
        <button @click="uploadRoute" class="upload-empty-btn">
          上传第一条路线
        </button>
      </div>
    </div>
    <el-footer class="footer">
      <p class="footer-text">© 2025 卧云车队 | 行者至千里，卧云看浮沉</p>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
// Replace global routes API imports with direct http client for page-specific override
import { http } from '../api/axios.js'
import { testStaticMapAPI } from '../utils/mapUtils.js'
import '../style/header.css';
import { API_CONFIG, getFullImageUrl } from '../config/index.js'
import { loadImageWithHeaders } from '../utils/imageLoader.js'

// 获取API基地址
const API_BASE = API_CONFIG.baseURL

// 获取认证头（从localStorage读取token）
const getAuthHeader = () => {
  const token = localStorage.getItem('woyun_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Page-local API wrappers targeting Cloudflare domain
const getRoutesCF = async (params = {}) => {
  return await http.get(`${API_BASE}/api/routes`, { params, headers: getAuthHeader() })
}

const getRouteDetailCF = async (routeId) => {
  return await http.get(`${API_BASE}/api/routes/${routeId}`, { headers: getAuthHeader() })
}

const createRouteCF = async (routeData, gpxFile) => {
  const formData = new FormData()
  const routeBlob = new Blob([JSON.stringify(routeData)], { type: 'application/json' })
  formData.append('route', routeBlob)
  if (gpxFile) formData.append('gpxFile', gpxFile)
  return await http.upload(`${API_BASE}/api/routes`, formData)
}

// 状态管理
const activeMenu = ref('3')
const showRouteForm = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)

// 初始化router
const router = useRouter()

// 表单引用
const routeFormRef = ref(null)
const uploadRef = ref(null)
const gpxInput = ref(null)
const backgroundRef = ref(null)
const pageHeaderRef = ref(null)
const filtersRef = ref(null)
const statsRef = ref(null)
const routesGridRef = ref(null)
const routeRefs = reactive({})

// 路线表单数据
const routeForm = reactive({
  title: '',
  description: '',
  difficulty: '',
  routeType: '',
  gpxFile: null
})

// 表单验证规则
const routeFormRules = {
  title: [
    { required: true, message: '请输入路线标题', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  routeType: [
    { required: true, message: '请选择路线类型', trigger: 'change' }
  ]
}

// 筛选条件
const filters = reactive({
  difficulty: '',
  distance: '',
  type: ''
})

// 路线数据
const routes = ref([])
const selectedRoute = ref(null)

// 计算属性
const filteredRoutes = computed(() => {
  let result = [...routes.value]
  
  // 难度筛选
  if (filters.difficulty) {
    result = result.filter(route => route.difficulty === filters.difficulty)
  }
  
  // 类型筛选
  if (filters.type) {
    result = result.filter(route => route.type === filters.type)
  }
  
  // 距离筛选
  if (filters.distance) {
    result = result.filter(route => {
      const distance = route.distance
      switch (filters.distance) {
        case '0-20':
          return distance >= 0 && distance <= 20
        case '20-50':
          return distance > 20 && distance <= 50
        case '50-100':
          return distance > 50 && distance <= 100
        case '100+':
          return distance > 100
        default:
          return true
      }
    })
  }
  
  return result
})

const totalDistance = computed(() => {
  return filteredRoutes.value.reduce((sum, route) => sum + (route.distance || 0), 0)
})

const averageDistance = computed(() => {
  const count = filteredRoutes.value.length
  return count > 0 ? Math.round(totalDistance.value / count) : 0
})

// 菜单选择处理
const handleMenuSelect = (key) => {
  activeMenu.value = key
  // 路由跳转逻辑
  if (key === '1') {
    // 首页
    router.push('/')
  } else if (key === '2-2') {
    // 车队成员页面
    router.push('/team-member')
  } else if (key === '4') {
    // 活动动态页面
    ElMessage.info('这个页面认不得咋个做')
  } else if (key === '5') {
    // 卧云社区页面
    router.push('/community')
  } else if (key === '6') {
    // 联系我们页面
    router.push('/contact')
  }
}

// 上传路线
const uploadRoute = () => {
  showRouteForm.value = true
  resetRouteForm()
}

// 重置表单
const resetRouteForm = () => {
  routeForm.title = ''
  routeForm.description = ''
  routeForm.difficulty = ''
  routeForm.routeType = ''
  routeForm.gpxFile = null
  
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 文件选择处理
const handleFileChange = (file) => {
  const allowedTypes = ['.gpx', '.kml', '.tcx']
  const fileName = file.name.toLowerCase()
  const isValid = allowedTypes.some(type => fileName.endsWith(type))
  
  if (!isValid) {
    ElMessage.error('只能是gpx格式文件嘎')
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    return false
  }
  
  routeForm.gpxFile = file.raw
  return true
}

const handleFileRemove = () => {
  routeForm.gpxFile = null
}

// 表单关闭处理
const handleFormClose = (done) => {
  ElMessageBox.confirm('确定要关闭表单吗？未保存的数据将会丢失')
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户点击了取消
    })
}

// 取消表单
const cancelRouteForm = () => {
  showRouteForm.value = false
}

// 提交表单
const submitRouteForm = async () => {
  if (!routeFormRef.value) return
  
  await routeFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请填写所有必填项')
      return
    }
    
    if (!routeForm.gpxFile) {
      ElMessage.error('请选择GPX文件')
      return
    }
    
    try {
      isSubmitting.value = true
      
      const routeData = {
        title: routeForm.title,
        description: routeForm.description,
        difficulty: routeForm.difficulty,
        routeType: routeForm.routeType
      }
      
      console.log('准备上传的路线数据:', routeData)
      
      const newRoute = await createRouteCF(routeData, routeForm.gpxFile)
      
      const processedRoute = {
        id: newRoute.id,
        title: newRoute.title,
        description: newRoute.description,
        distance: newRoute.distance,
        elevation: newRoute.elevationGain || newRoute.elevation || 0,
        estimatedTime: newRoute.estimatedTime || '未知',
        difficulty: newRoute.difficulty || 'medium',
        type: newRoute.routeType || newRoute.type || 'scenic',
        thumbnail: getFullImageUrl(newRoute.thumbnailUrl || newRoute.thumbnail),
        isGeneratingThumbnail: false,
        gpxFile: newRoute.gpxFile || '',
        createdAt: new Date(newRoute.createdAt),
        creator: {
          id: newRoute.creator?.id,
          name: newRoute.creator?.name || '当前用户',
          avatar: getFullImageUrl(newRoute.creator?.avatarUrl)
        },
        stats: {
          completions: newRoute.stats?.completions || 0,
          likes: newRoute.stats?.likes || 0,
          comments: newRoute.stats?.comments || 0
        }
      }
      
      routes.value.unshift(processedRoute)
      
      console.log('✅ 路线上传成功:', processedRoute)
      ElMessage.success(`路线"${routeForm.title}"创建成功！`)
      
      showRouteForm.value = false
      
    } catch (error) {
      console.error('❌ 路线上传失败:', error)
      ElMessage.error('路线创建失败: ' + (error.message || '未知错误'))
    } finally {
      isSubmitting.value = false
    }
  })
}

// 筛选路线
const filterRoutes = () => {
  console.log('筛选路线:', filters)
}

// 查看路线详情
const viewRouteDetail = (routeId) => {
  console.log('点击进入路线详情，路线ID:', routeId)
  router.push(`/routes/${routeId}`)
}

// 下载GPX文件
const downloadGPXFile = async (routeId) => {
  try {
    console.log('📥 下载GPX文件，路线ID:', routeId)
    
    const route = routes.value.find(r => r.id === routeId)
    if (!route) {
      console.error('❌ 未找到路线信息')
      ElMessage.error('路线信息不存在')
      return
    }
    
    console.log('🔍 路线信息:', route)
    console.log('🔍 gpxFileUrl字段:', route.gpxFileUrl)
    
    if (route.gpxFileUrl) {
      const fullUrl = getFullImageUrl(route.gpxFileUrl)
      
      console.log('🔗 使用gpxFileUrl下载:', fullUrl)
      
      const link = document.createElement('a')
      link.href = fullUrl
      link.download = `${route.title}.gpx`
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      
      console.log('✅ GPX文件下载完成:', route.title)
      ElMessage.success('GPX文件下载成功')
    } else {
      console.log('🔄 gpxFileUrl字段不存在，尝试获取路线详情')
      
      try {
        const routeDetail = await getRouteDetailCF(routeId)
        console.log('🔍 路线详情:', routeDetail)
        
        if (routeDetail.gpxFileUrl) {
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

// 分享路线
const shareRoute = (routeId) => {
  const url = `${window.location.origin}/routes/${routeId}`
  
  if (navigator.share) {
    navigator.share({
      title: '分享骑行路线',
      url: url
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert('路线链接已复制到剪贴板')
    }).catch(() => {
      alert('分享失败，请重试')
    })
  }
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

// 获取类型文本
const getTypeText = (type) => {
  const map = {
    mountain: '山地',
    road: '公路',
    city: '城市',
    scenic: '风景'
  }
  return map[type] || type
}

// 加载路线列表
const loadRoutes = async () => {
  try {
    isLoading.value = true
    
    const params = {
      page: 0,
      size: 50
    }
    
    if (filters.difficulty) params.difficulty = filters.difficulty
    if (filters.type) params.type = filters.type
    
    console.log('🔍 加载路线列表，参数:', params)
    
    const response = await getRoutesCF(params)
    console.log('📨 路线列表响应:', response)
    
    const responseData = response.data || response
    let rawRoutes = responseData.content || responseData || []
    
    const processedRoutes = rawRoutes.map(async (route) => {
      console.log('🔍 处理路线:', route)
      
      const thumbnail = getFullImageUrl(route.thumbnailUrl || route.thumbnail)
      
      console.log('🖼️ 路线缩略图URL:', thumbnail)
      console.log('📄 路线gpxFileUrl:', route.gpxFileUrl)
      
      const creatorAvatar = getFullImageUrl(route.creator?.avatarUrl || route.creator?.avatar)
      
      // 使用新的图片加载工具处理缩略图
      const processedThumbnail = await loadImageWithHeaders(thumbnail)
      const processedCreatorAvatar = await loadImageWithHeaders(creatorAvatar)
      
      return {
        id: route.id,
        title: route.title,
        description: route.description,
        distance: route.distance,
        elevation: route.elevationGain || route.elevation || 0,
        estimatedTime: route.estimatedTime || '未知',
        difficulty: route.difficulty || 'medium',
        type: route.routeType || route.type || 'scenic',
        thumbnail: processedThumbnail,
        gpxFileUrl: route.gpxFileUrl || '',
        isGeneratingThumbnail: false,
        gpxFile: route.gpxFile || '',
        createdAt: new Date(route.createdAt),
        creator: {
          id: route.creator?.id,
          name: route.creator?.name || route.creator?.username || '未知用户',
          avatar: processedCreatorAvatar
        },
        stats: {
          completions: route.stats?.completions || 0,
          likes: route.stats?.likes || 0,
          comments: route.stats?.comments || 0
        }
      }
    })
    
    routes.value = await Promise.all(processedRoutes)
    console.log('✅ 路线列表加载完成，共', processedRoutes.length, '条路线')
    console.log('📋 路线数据:', processedRoutes)
    
  } catch (error) {
    console.error('❌ 加载路线列表失败:', error)
    alert('加载路线列表失败: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// 图片加载处理
const handleImageLoad = (event) => {
  event.target.classList.add('image-loaded')
  console.log('✅ 路线缩略图加载成功:', event.target.src)
}

const handleImageError = (event) => {
  console.error('❌ 路线缩略图加载失败:', event.target.src)
  console.log('🔄 切换到默认缩略图')
  event.target.src = '/imagines/Background2.jpg'
  event.target.classList.add('image-error')
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

  const elementsToObserve = [
    pageHeaderRef.value,
    filtersRef.value,
    statsRef.value,
    routesGridRef.value
  ]
  
  elementsToObserve.forEach((el) => {
    if (el) {
      observer.observe(el)
    }
  })

  // 观察路线卡片
  nextTick(() => {
    const routeElements = document.querySelectorAll('.route-card')
    routeElements.forEach((el) => {
      if (el) {
        observer.observe(el)
      }
    })
  })
}

// 生命周期
onMounted(async () => {
  if (backgroundRef.value) {
    backgroundRef.value.classList.add('background-fade-in')
  }
  
  try {
    await testStaticMapAPI()
    console.log('✅ 高德API测试通过')
  } catch (error) {
    console.error('❌ 高德API测试失败:', error)
  }
  
  await loadRoutes()
  
  // 数据加载完成后初始化动画观察器
  setTimeout(() => {
    observeElements()
  }, 100)
  
  console.log('骑行路线页面加载完成')
})

</script>

<style scoped>
@import '../style/cyclingRoutes.css';
</style>