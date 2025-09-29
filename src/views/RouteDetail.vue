<template>
  <div class="route-detail">
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
        background-color="#122031"
        text-color="#fff"
        active-text-color="#ffd04b"
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

    <div class="route-detail-container">
      <!-- 返回按钮 -->
      <div class="back-nav">
        <button @click="goBack" class="back-btn">
          ← 返回路线列表
        </button>
      </div>

      <!-- 路线详情 -->
      <div v-if="routeData" class="route-detail-content">
        <!-- 路线基本信息 -->
        <div class="route-header" ref="routeHeaderRef">
          <div class="route-basic-info">
            <h1 class="route-title">{{ routeData.title }}</h1>
            <p class="route-description">{{ routeData.description }}</p>
            
            <div class="route-stats-detail">
              <div class="stat-item">
                <div class="stat-icon">📏</div>
                <div class="stat-content">
                  <div class="stat-value">{{ routeData.distance }} km</div>
                  <div class="stat-label">总距离</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">⛰️</div>
                <div class="stat-content">
                  <div class="stat-value">{{ routeData.elevation }} m</div>
                  <div class="stat-label">累计爬升</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                  <div class="stat-value">{{ routeData.estimatedTime }}</div>
                  <div class="stat-label">预计时间</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🏃</div>
                <div class="stat-content">
                  <div class="stat-value">{{ getDifficultyText(routeData.difficulty) }}</div>
                  <div class="stat-label">难度等级</div>
                </div>
              </div>
            </div>
            
            <div class="route-actions-detail">
              <button @click="downloadGPXRoute" class="action-btn-detail primary">
                📥 下载GPX
              </button>
              <button @click="shareRoute" class="action-btn-detail">
                🔗 分享路线
              </button>
              <button @click="startNavigation" class="action-btn-detail">
                🧭 开始导航
              </button>
            </div>
          </div>
          
          <div class="route-creator">
            <h3>创建者</h3>
            <div class="creator-info">
              <img :src="routeData.creator.avatar" :alt="routeData.creator.name" class="creator-avatar" @click="goToCreatorProfile" style="cursor: pointer;">
              <div class="creator-details">
                <span class="creator-name" @click="goToCreatorProfile" style="cursor: pointer;">{{ routeData.creator.name }}</span>
                <span class="creator-date">{{ formatDate(routeData.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 地图区域 -->
        <div class="map-section" ref="mapSectionRef">
          <div class="map-header">
            <h2>路线地图</h2>
            <div class="map-controls">
              <button @click="fitToRoute" class="map-control-btn">
                🎯 回到路线
              </button>
              <!-- <button @click="toggleMapType" class="map-control-btn">
                🗺️ {{ mapType === 'satellite' ? '标准' : '卫星' }}
              </button> -->
              <button @click="toggleFullscreen" class="map-control-btn">
                🔍 {{ isFullscreen ? '退出放大' : '放大显示' }}
              </button>
            </div>
          </div>
          
          <!-- 高德地图容器 -->
          <div 
            ref="mapContainer" 
            class="amap-container"
            :class="{ 'fullscreen': isFullscreen }"
          >
            <!-- 放大模式下的退出按钮 -->
            <button 
              v-if="isFullscreen" 
              @click="toggleFullscreen" 
              class="fullscreen-exit-btn"
            >
              ✕ 退出放大
            </button>
          </div>
          
          <!-- 地图加载状态 -->
          <div v-if="mapLoading" class="map-loading">
            <div class="loading-spinner"></div>
            <p>正在加载地图...</p>
          </div>
        </div>

        <!-- 路线详细信息 -->
        <div class="route-details-section" ref="detailsSectionRef">
          <h2>路线详情</h2>
          
          <div class="details-grid">
            <!-- 路线特点 -->
            <div class="detail-card">
              <h3>路线特点</h3>
              <div class="feature-tags">
                <span class="feature-tag" :class="routeData.difficulty">
                  {{ getDifficultyText(routeData.difficulty) }}
                </span>
                <span class="feature-tag type">
                  {{ getTypeText(routeData.type) }}
                </span>
                <span v-for="feature in routeData.features" :key="feature" class="feature-tag">
                  {{ feature }}
                </span>
              </div>
            </div>
            
            <!-- 路况信息 -->
            <div class="detail-card">
              <h3>路况信息</h3>
              <div class="road-info">
                <div class="road-item">
                  <span class="road-label">路面类型：</span>
                  <span>{{ routeData.roadType }}</span>
                </div>
                <div class="road-item">
                  <span class="road-label">交通状况：</span>
                  <span>{{ routeData.traffic }}</span>
                </div>
                <div class="road-item">
                  <span class="road-label">最佳时间：</span>
                  <span>{{ routeData.bestTime }}</span>
                </div>
              </div>
            </div>
            
            <!-- 装备建议 -->
            <div class="detail-card">
              <h3>装备建议</h3>
              <div class="equipment-list">
                <div v-for="item in routeData.equipment" :key="item" class="equipment-item">
                  • {{ item }}
                </div>
              </div>
            </div>
            
            <!-- 注意事项 -->
            <div class="detail-card">
              <h3>注意事项</h3>
              <div class="notes-list">
                <div v-for="note in routeData.notes" :key="note" class="note-item">
                  ⚠️ {{ note }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计和评价 -->
        <div class="route-stats-section" ref="statsSectionRef">
          <h2>路线统计</h2>
          
          <div class="stats-cards">
            <div class="stats-card">
              <div class="stats-number">{{ routeData.stats.completions }}</div>
              <div class="stats-label">完成次数</div>
            </div>
            <div class="stats-card">
              <div class="stats-number">{{ routeData.stats.likes }}</div>
              <div class="stats-label">点赞数</div>
            </div>
            <div class="stats-card">
              <div class="stats-number">{{ routeData.stats.comments }}</div>
              <div class="stats-label">评论数</div>
            </div>
            <div class="stats-card">
              <div class="stats-number">{{ routeData.averageRating || '4.5' }}</div>
              <div class="stats-label">平均评分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载路线详情...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AMAP_CONFIG, checkConfig } from '../config/index.js'
import { getRouteDetail, downloadGPX, getRoutePoints } from '../api/routes.js'
import { loadAmapScript, createMap, drawRoute } from '../utils/mapUtils.js'
import '../style/header.css';
import { getFullImageUrl, processImageUrls } from '../config/index.js'

const currentRoute = useRoute()
const router = useRouter()
const activeMenu = ref('3')

// 检查配置
checkConfig()

// 状态管理
const routeData = ref(null)
const mapLoading = ref(true)
const mapType = ref('standard')
const isFullscreen = ref(false)
const map = ref(null)
const routeLine = ref(null)

// DOM引用
const mapContainer = ref(null)
const routeHeaderRef = ref(null)
const mapSectionRef = ref(null)
const detailsSectionRef = ref(null)
const statsSectionRef = ref(null)

// 模拟路线详细数据
const mockRouteData = {
  1: {
    id: 1,
    title: '西湖环骑经典路线',
    description: '环绕美丽西湖的经典骑行路线，适合休闲骑行，沿途风景优美，是初学者的理想选择。这条路线经过多个景点，包括断桥残雪、苏堤春晓、花港观鱼等，让你在运动的同时享受杭州的美景。',
    distance: 15.2,
    elevation: 120,
    estimatedTime: '1-2小时',
    difficulty: 'easy',
    type: 'scenic',
    creator: {
      id: 1,
      name: '张三',
      avatar: '/imagines/members/avatar/zhou.jpg'
    },
    createdAt: new Date('2024-01-15'),
    stats: {
      completions: 25,
      likes: 18,
      comments: 5
    },
    features: ['风景优美', '适合新手', '人文景观'],
    roadType: '城市道路/景区道路',
    traffic: '人流较多，注意避让',
    bestTime: '早晨6-9点，傍晚17-19点',
    equipment: ['头盔', '骑行眼镜', '水壶', '简单维修工具'],
    notes: [
      '注意避让行人和游客',
      '部分路段禁止骑行，需推行',
      '雨天路滑，建议避免骑行',
      '节假日人流量大，建议错峰出行'
    ],
    gpxData: {
      // 模拟GPX路径点数据
      points: [
        [120.1551, 30.2741], // 西湖起点
        [120.1580, 30.2760],
        [120.1610, 30.2780],
        [120.1640, 30.2760],
        [120.1620, 30.2720],
        [120.1580, 30.2700],
        [120.1551, 30.2741]  // 回到起点
      ]
    }
  },
  2: {
    id: 2,
    title: '千岛湖挑战路线',
    description: '千岛湖周边的挑战性路线，包含多个爬坡路段，适合有一定基础的骑行爱好者。风景绝佳但难度较高。',
    distance: 68.5,
    elevation: 890,
    estimatedTime: '4-6小时',
    difficulty: 'hard',
    type: 'mountain',
    creator: {
      id: 2,
      name: '李四',
      avatar: '/imagines/members/avatar/guo.jpg'
    },
    createdAt: new Date('2024-02-20'),
    stats: {
      completions: 8,
      likes: 12,
      comments: 3
    },
    features: ['挑战性强', '风景绝佳', '山地地形'],
    roadType: '山地公路/土路',
    traffic: '交通稀少，注意安全',
    bestTime: '春秋季节，避开高温天气',
    equipment: ['山地车', '头盔', '防护装备', '维修工具', '充足水和食物'],
    notes: [
      '需要较好的体能和技术',
      '建议组队骑行，互相照应',
      '携带急救药品和通讯设备',
      '天气不佳时不要冒险出行'
    ],
    gpxData: {
      points: [
        [119.0256, 29.6038], // 千岛湖起点
        [119.0356, 29.6138],
        [119.0456, 29.6238],
        [119.0556, 29.6338],
        [119.0656, 29.6238],
        [119.0556, 29.6138],
        [119.0256, 29.6038]
      ]
    }
  },
  3: {
    id: 3,
    title: '城市穿越路线',
    description: '穿越城市核心区域的路线，经过多个地标建筑，适合了解城市文化的骑行路线。',
    distance: 32.1,
    elevation: 180,
    estimatedTime: '2-3小时',
    difficulty: 'medium',
    type: 'city',
    creator: {
      id: 3,
      name: '王五',
      avatar: '/imagines/members/avatar/zhou.jpg'
    },
    createdAt: new Date('2024-03-10'),
    stats: {
      completions: 15,
      likes: 20,
      comments: 8
    },
    features: ['城市文化', '地标建筑', '交通便利'],
    roadType: '城市道路/自行车道',
    traffic: '交通繁忙，遵守交通规则',
    bestTime: '周末早上，避开上下班高峰',
    equipment: ['城市车', '头盔', '反光背心', '车灯'],
    notes: [
      '严格遵守交通信号灯',
      '注意机动车和行人',
      '避开交通高峰时段',
      '保持醒目的骑行装备'
    ],
    gpxData: {
      points: [
        [120.1614, 30.2936], // 城市中心起点
        [120.1714, 30.3036],
        [120.1814, 30.3136],
        [120.1914, 30.3036],
        [120.1814, 30.2936],
        [120.1714, 30.2836],
        [120.1614, 30.2936]
      ]
    }
  },
  4: {
    id: 4,
    title: '沿海风景线',
    description: '沿着海岸线的美丽路线，可以欣赏到壮观的海景和日出日落，是摄影爱好者的天堂。',
    distance: 45.8,
    elevation: 200,
    estimatedTime: '3-4小时',
    difficulty: 'medium',
    type: 'scenic',
    creator: {
      id: 1,
      name: '张三',
      avatar: '/imagines/members/avatar/zhou.jpg'
    },
    createdAt: new Date('2024-03-25'),
    stats: {
      completions: 12,
      likes: 22,
      comments: 6
    },
    features: ['海景壮丽', '日出日落', '摄影圣地'],
    roadType: '沿海公路',
    traffic: '车量中等，注意海风',
    bestTime: '清晨和黄昏，光线最佳',
    equipment: ['公路车', '防风镜', '防晒霜', '相机'],
    notes: [
      '注意海风影响，保持平衡',
      '适合拍照留念，但不要影响骑行',
      '带充足的水和防晒用品',
      '注意潮汐时间和天气变化'
    ],
    gpxData: {
      points: [
        [121.5047, 31.2435], // 沿海起点
        [121.5147, 31.2535],
        [121.5247, 31.2635],
        [121.5347, 31.2535],
        [121.5247, 31.2435],
        [121.5147, 31.2335],
        [121.5047, 31.2435]
      ]
    }
  }
}

// 方法
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

const goBack = () => {
  router.push('/routes')
}

const goToCreatorProfile = () => {
  if (routeData.value?.creator?.id) {
    router.push(`/user/${routeData.value.creator.id}`)
  }
}

const downloadGPXRoute = async () => {
  if (!routeData.value) return
  
  try {
    console.log('📥 下载GPX文件，路线:', routeData.value)
    
    // 检查是否有gpxFileUrl字段
    if (routeData.value.gpxFileUrl) {
      // 直接从gpxFileUrl下载文件 - 使用统一的URL处理函数
      const fullUrl = getFullImageUrl(routeData.value.gpxFileUrl)
      
      console.log('🔗 使用gpxFileUrl下载:', fullUrl)
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = fullUrl
      link.download = `${routeData.value.title}.gpx`
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      
      console.log('✅ GPX文件下载完成:', routeData.value.title)
      ElMessage.success('GPX文件下载成功')
    } else {
      console.log('🔄 gpxFileUrl字段不存在，尝试重新获取路线详情')
      
      try {
        // 重新获取路线详情
        const updatedRouteData = await getRouteDetail(routeData.value.id)
        console.log('🔍 更新的路线详情:', updatedRouteData)
        
        if (updatedRouteData.gpxFileUrl) {
          // 使用统一的URL处理函数
          const fullUrl = getFullImageUrl(updatedRouteData.gpxFileUrl)
          
          console.log('🔗 使用详情中的gpxFileUrl下载:', fullUrl)
          
          const link = document.createElement('a')
          link.href = fullUrl
          link.download = `${updatedRouteData.title || routeData.value.title}.gpx`
          document.body.appendChild(link)
          link.click()
          
          document.body.removeChild(link)
          
          console.log('✅ GPX文件下载完成:', updatedRouteData.title || routeData.value.title)
          ElMessage.success('GPX文件下载成功')
        } else {
          console.warn('⚠️ 该路线没有可用的GPX文件')
          ElMessage.warning('该路线没有可用的GPX文件')
        }
      } catch (detailError) {
        console.error('❌ 获取路线详情失败:', detailError)
        ElMessage.error('获取路线详情失败，无法下载GPX文件')
      }
    }
  } catch (error) {
    console.error('❌ 下载GPX文件失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

const shareRoute = () => {
  const url = window.location.href
  
  if (navigator.share) {
    navigator.share({
      title: routeData.value?.title || '骑行路线',
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

const startNavigation = () => {
  // TODO: 集成高德导航API
  console.log('开始导航')
  alert('导航功能开发中')
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

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const initMap = async () => {
  try {
    await loadAmapScript()
    
    if (!mapContainer.value) return

    // 创建地图实例
    map.value = createMap(mapContainer.value, {
      zoom: 13,
      mapStyle: 'amap://styles/normal',
      viewMode: '2D'
    })

    // 绘制路线
    if (routeData.value?.gpxData?.points) {
      routeLine.value = drawRoute(map.value, routeData.value.gpxData.points)
      // 调整地图视野以适应路线
      fitToRoute()
    }

    mapLoading.value = false
  } catch (error) {
    console.error('地图加载失败:', error)
    mapLoading.value = false
    alert('地图加载失败，请检查网络连接')
  }
}

const fitToRoute = () => {
  if (map.value && routeLine.value) {
    // 设置适合的视图范围，并添加一些边距
    map.value.setFitView([routeLine.value], false, [50, 50, 50, 50])
  }
}

const toggleMapType = () => {
  if (!map.value) return

  if (mapType.value === 'standard') {
    map.value.setMapStyle('amap://styles/satellite')
    mapType.value = 'satellite'
  } else {
    map.value.setMapStyle('amap://styles/normal')
    mapType.value = 'standard'
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  // 控制map-section的overflow
  if (mapSectionRef.value) {
    if (isFullscreen.value) {
      mapSectionRef.value.classList.add('has-fullscreen-map')
    } else {
      mapSectionRef.value.classList.remove('has-fullscreen-map')
    }
  }
  
  nextTick(() => {
    if (map.value) {
      setTimeout(() => {
        // 强制重新计算地图容器尺寸
        map.value.getSize()
        map.value.getSize()
        
        // 重新设置地图视图
        if (isFullscreen.value) {
          // 全屏模式：设置合适的缩放级别
          map.value.setZoom(12)
        }
        
        // 重新适配路线
        fitToRoute()
      }, 500) // 增加更长的延迟确保DOM完全更新
    }
  })
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
    routeHeaderRef.value,
    mapSectionRef.value,
    detailsSectionRef.value,
    statsSectionRef.value
  ]
  
  elementsToObserve.forEach((el) => {
    if (el) {
      observer.observe(el)
    }
  })
}

// 生命周期
onMounted(async () => {
  // 获取路线ID
  const routeId = parseInt(currentRoute.params.id)
  console.log('获取到的路线ID:', routeId)
  
  // 从后端API获取路线详情
  try {
    const fetchedRouteData = await getRouteDetail(routeId)
    console.log('📡 API获取的路线数据:', fetchedRouteData)
    
    // 获取路线点位数据
    let routePoints = []
    try {
      routePoints = await getRoutePoints(routeId)
      console.log('📍 路线点位数据:', routePoints)
    } catch (pointsError) {
      console.warn('获取路线点位数据失败，使用默认数据:', pointsError)
    }
    
    // 处理路线数据格式
    routeData.value = {
      id: fetchedRouteData.id,
      title: fetchedRouteData.title,
      description: fetchedRouteData.description,
      distance: fetchedRouteData.distance,
      elevation: fetchedRouteData.elevationGain || fetchedRouteData.elevation || 0,
      estimatedTime: fetchedRouteData.estimatedTime || '未知',
      difficulty: fetchedRouteData.difficulty || 'medium',
      type: fetchedRouteData.type || 'scenic',
      creator: {
        id: fetchedRouteData.creator?.id,
        name: fetchedRouteData.creator?.name || '未知用户',
        // 使用统一的图片URL处理函数
        avatar: getFullImageUrl(fetchedRouteData.creator?.avatarUrl || fetchedRouteData.creator?.avatar)
      },
      createdAt: new Date(fetchedRouteData.createdAt),
      stats: {
        completions: fetchedRouteData.stats?.completions || 0,
        likes: fetchedRouteData.stats?.likes || 0,
        comments: fetchedRouteData.stats?.comments || 0
      },
      features: fetchedRouteData.features || [],
      roadType: fetchedRouteData.roadType || '未知',
      traffic: fetchedRouteData.traffic || '未知',
      bestTime: fetchedRouteData.bestTime || '未知',
      equipment: fetchedRouteData.equipment || [],
      notes: fetchedRouteData.notes || [],
      gpxData: {
        points: routePoints && routePoints.length > 0 
          ? routePoints.map(point => [point.longitude, point.latitude]) 
          : (fetchedRouteData.gpxPoints && fetchedRouteData.gpxPoints.length > 0 
             ? fetchedRouteData.gpxPoints.map(point => [point.longitude, point.latitude]) 
             : [])
      }
    }
    
    console.log('✅ 处理后的路线数据:', routeData.value)
  } catch (error) {
    console.error('❌ 获取路线详情失败:', error)
    alert('获取路线详情失败: ' + error.message)
    
    // 如果API调用失败，使用模拟数据
    routeData.value = mockRouteData[routeId]
  }

  // 初始化地图
  await initMap()
  
  // 初始化动画观察器
  setTimeout(() => {
    observeElements()
  }, 100)
  
  console.log('路线详情页面加载完成')
})

onUnmounted(() => {
  // 清理地图资源
  if (map.value) {
    map.value.destroy()
  }
})
</script>

<style scoped>
@import '../style/routeDetail.css';
</style>