<template>
  <div class="team-member">
    <!-- 顶部导航 (复用) -->
    <el-header class="header" :class="{ 'header-hidden': !showHeader }">
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

    <!-- 英雄区域 -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
        <video autoplay muted loop  playsinline class="hero-video"> <!-- 新增 playsinline 属性，该属性非常重要，ios端不加就播放不了。作用是阻止视频全屏播放（因为这是背景视频） -->
          <source src="https://cable-website-video.oss-cn-beijing.aliyuncs.com/9%E6%9C%8829%E6%97%A5.mp4" type="video/mp4">
        </video>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">我们的骑行者</h1>
          <p class="hero-subtitle">开拓精神是卧云的立身基准——创新、探索不同寻常之路、突破极限</p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number"><!-- {{ members.length }} -->10+</span>
              <span class="stat-label">活跃成员</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50K+</span>
              <span class="stat-label">总骑行里程</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">100+</span>
              <span class="stat-label">征服路线</span>
            </div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
      </div>
    </div>

    <!-- 成员网格展示 -->
    <div class="members-grid-section">
      <div class="section-title">
        <h2>认识我们的骑行伙伴</h2>
        <p>每一位成员都有着独特的故事和不凡的骑行经历</p>
      </div>
      
      <div class="members-grid">
        <div 
          v-for="(member, index) in members" 
          :key="member.id"
          class="member-card fade-in"
          @click="selectMember(member)"
          :ref="(el: any) => memberRefs[member.id] = el as HTMLElement"
        >
          <div class="member-card-content">
            <div class="member-avatar">
              <img :src="member.avatar" :alt="member.name" class="avatar-img">
            </div>
            <h3 class="member-name">{{ member.name }}</h3>
            <p class="member-position">{{ member.position }}</p>
            <div class="member-tags">
              <span v-for="tag in member.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="member-stats">
              <div class="stat">
                <span class="stat-value">{{ member.experience }}</span>
                <span class="stat-label">经验</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ member.totalDistance }}</span>
                <span class="stat-label">里程</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ member.joinDate }}</span>
                <span class="stat-label">加入</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员详情模态框 -->
    <div v-if="selectedMember" class="member-modal active" @click="closeMemberModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeMemberModal">×</button>
        
        <div class="modal-header">
          <div class="member-hero-simple">
            <div class="member-avatar-large">
              <img :src="selectedMember.avatar" :alt="selectedMember.name" class="avatar-large">
            </div>
            <div class="member-details">
              <h2 class="member-name-large">{{ selectedMember.name }}</h2>
              <p class="member-position-large">{{ selectedMember.position }}</p>
              <div class="member-tags-large">
                <span v-for="tag in selectedMember.tags" :key="tag" class="tag-large">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <div class="member-story">
            <h3 class="story-title">骑行故事</h3>
            <p class="story-content">{{ selectedMember.bio }}</p>
          </div>

          <div class="member-achievements">
            <h3 class="achievements-title">骑行成就</h3>
            <div class="achievements-grid">
              <div class="achievement-item">
                <div class="achievement-icon">🚴</div>
                <div class="achievement-info">
                  <span class="achievement-value">{{ selectedMember.experience }}</span>
                  <span class="achievement-label">骑行经验</span>
                </div>
              </div>
              <div class="achievement-item">
                <div class="achievement-icon">📏</div>
                <div class="achievement-info">
                  <span class="achievement-value">{{ selectedMember.totalDistance }}</span>
                  <span class="achievement-label">总里程</span>
                </div>
              </div>
              <div class="achievement-item">
                <div class="achievement-icon">📅</div>
                <div class="achievement-info">
                  <span class="achievement-value">{{ selectedMember.joinDate }}</span>
                  <span class="achievement-label">加入时间</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 模态框标签 -->
          <div class="modal-tabs">
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'personal' }"
              @click="switchTab('personal')"
            >
              个人信息
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'bike' }"
              @click="switchTab('bike')"
            >
              装备信息
            </button>
          </div>

          <!-- 个人信息标签内容 -->
          <div class="tab-content" :class="{ active: activeTab === 'personal' }">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">骑行经验</div>
                <div class="info-value">{{ selectedMember.experience }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">总里程</div>
                <div class="info-value">{{ selectedMember.totalDistance }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">加入时间</div>
                <div class="info-value">{{ selectedMember.joinDate }}</div>
              </div>
            </div>
            <div class="personal-photo-container">
              <img :src="selectedMember.lifePhoto" :alt="selectedMember.name" class="personal-photo" />
            </div>
          </div>

          <!-- 装备信息标签内容 -->
          <div class="tab-content" :class="{ active: activeTab === 'bike' }">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">品牌</div>
                <div class="info-value">{{ selectedMember.bikeBrand }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">型号</div>
                <div class="info-value">{{ selectedMember.bikeModel }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">车架</div>
                <div class="info-value">{{ selectedMember.bikeFrame }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">变速</div>
                <div class="info-value">{{ selectedMember.bikeGears }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">重量</div>
                <div class="info-value">{{ selectedMember.bikeWeight }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">购买时间</div>
                <div class="info-value">{{ selectedMember.bikePurchaseDate }}</div>
              </div>
            </div>
            <img :src="selectedMember.bikePhoto" :alt="selectedMember.name + '的自行车'" class="bike-image" />
            <p class="modal-member-bio">{{ selectedMember.bikeDescription }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 (复用) -->
    <el-footer class="footer">
      <p class="footer-text">© 2025 卧云车队 | 行者至千里，卧云看浮沉</p>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import '../style/TeamMember.css';
import '../style/header.css';

interface Member {
  id: string;
  name: string;
  position: string;
  tags: string[];
  avatar: string;
  bio: string;
  experience: string;
  totalDistance: string;
  joinDate: string;
  lifePhoto: string;
  bikePhoto: string;
  bikeBrand: string;
  bikeModel: string;
  bikeFrame: string;
  bikeGears: string;
  bikeWeight: string;
  bikePurchaseDate: string;
  bikeDescription: string;
}

const activeMenu = ref("2-2");
const selectedMember = ref<Member | null>(null);
const memberRefs = reactive<Record<string, HTMLElement | null>>({});
const showHeader = ref(false); // 控制header显示隐藏
let lastScrollY = 0; // 记录上次滚动位置

// 初始化router
const router = useRouter();

// 成员数据
const members = ref<Member[]>([
  {
    id: 'zhou',
    name: '周开播',
    position: '车队队长',
    tags: ['资深骑手', '路线规划师', '技术大牛'],
    avatar: import.meta.env.BASE_URL + 'imagines/members/avatar/zhou.jpg',
    bio: '卧云车队的创始人和精神领袖，拥有丰富的骑行经验和组织能力。热爱挑战各种路线，从山地越野到公路长途，都能够游刃有余。在他的带领下，卧云车队不仅仅是一个骑行组织，更是一个温暖的大家庭。',
    experience: '8年',
    totalDistance: '25000+公里',
    joinDate: '2021年',
    lifePhoto: import.meta.env.BASE_URL + 'imagines/members/show/zhou.jpg',
    bikePhoto: import.meta.env.BASE_URL + 'imagines/members/bike/zhou.jpg',
    bikeBrand: 'Merida',
    bikeModel: 'Scultura 9000',
    bikeFrame: '碳纤维',
    bikeGears: 'Shimano Ultegra 22速',
    bikeWeight: '7.3kg',
    bikePurchaseDate: '2022年',
    bikeDescription: '这是一辆专业级的公路车，采用高级碳纤维车架，重量轻盈且性能卓越。配备Shimano Ultegra级别的传动系统，变速平顺精准，适合长距离骑行和竞速活动。'
  },
  {
    id: 'guo',
    name: '郭大炮',
    position: '炊事员，伙夫',
    tags: ['逗比骑手', '路线破坏师', '牛魔王'],
    avatar: import.meta.env.BASE_URL + 'imagines/members/avatar/guo.jpg',
    bio: '卧云车队的逗比成员，搞笑担当，喜欢逗 others，喜欢打游戏，喜欢打篮球，喜欢打羽毛球，喜欢打tennis，喜欢打排球，喜欢打桌球，喜欢打台球，喜欢打冰球，喜欢打毛球，喜欢打保龄球...',
    experience: '5年',
    totalDistance: '15000+公里',
    joinDate: '2022年',
    lifePhoto: import.meta.env.BASE_URL + 'imagines/members/show/guo.jpg',
    bikePhoto: import.meta.env.BASE_URL + 'imagines/members/bike/guo.jpg',
    bikeBrand: '自组',
    bikeModel: '逗比',
    bikeFrame: '纸糊的',
    bikeGears: 'Shimano Ultegra 22速',
    bikeWeight: '7.8kg',
    bikePurchaseDate: '2022年',
    bikeDescription: '这是一辆自组装的自行车，虽然材料普通，但经过多次改装和调教，性能 surprisingly好。适合日常训练和短途骑行。'
  }
]);

const handleMenuSelect = (key: string) => {
  if (key === '1') {
    // 跳转到首页
    router.push('/');
  } else if (key === '3') {
    // 骑行路线页面
    router.push('/routes');
  } else if (key === '5') {
    // 卧云社区页面
    router.push('/community');
  }
  // 其他菜单项的处理逻辑可以在这里添加
};

const activeTab = ref('personal');
const selectMember = (member: Member) => {
  console.log('选择成员:', member.name); // 调试日志
  console.log('当前selectedMember:', selectedMember.value); // 调试日志
  selectedMember.value = member;
  console.log('设置后selectedMember:', selectedMember.value); // 调试日志
  activeTab.value = 'personal';
  // 使用nextTick确保DOM更新后再设置overflow
  nextTick(() => {
    document.body.style.overflow = 'hidden';
    console.log('模态框应该显示了'); // 调试日志
  });
};

const closeMemberModal = () => {
  console.log('关闭模态框'); // 调试日志
  selectedMember.value = null;
  document.body.style.overflow = 'auto';
};

const switchTab = (tab: string) => {
  activeTab.value = tab;
};

// 滚动监听函数
const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  // 如果向下滚动超过100px，显示header
  if (currentScrollY > 100 && currentScrollY > lastScrollY) {
    showHeader.value = true;
  }
  // 如果滚动到顶部附近，隐藏header
  else if (currentScrollY < 50) {
    showHeader.value = false;
  }
  
  lastScrollY = currentScrollY;
};

// 滚动动画观察器
const observeElements = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-active');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // 观察成员卡片
  Object.values(memberRefs).forEach((el) => {
    if (el) {
      observer.observe(el);
    }
  });
};

onMounted(() => {
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  setTimeout(() => {
    observeElements();
  }, 100);
});

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll);
});
</script>