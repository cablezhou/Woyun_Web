<template>
  <div class="home" ref="homeRef">
    <!-- 顶部导航 -->
    <el-header class="header" :class="{ 'header-hidden': !isHeaderVisible }">
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

    <!-- Hero Section -->
    <div class="hero-section" ref="heroSectionRef">
      <video autoplay muted loop class="hero-video">
        <source src="https://cable-website-video.oss-cn-beijing.aliyuncs.com/sample.mp4" type="video/mp4">
        您的浏览器不支持视频播放。
      </video>
      <div class="hero-content">
        <h1 class="hero-slogan">哈哈哈哈哈行者至千里，卧云看浮沉</h1>
        <p class="hero-subtitle">用车轮丈量世界，用心感受生活</p>
      </div>
    </div>

    <!-- 车队介绍 -->
    <div class="intro-section-new fade-in-section" ref="introRef">
      <div class="intro-content-new">
        <div class="intro-image-new">
          <img src="/imagines/carousel/c1.jpg" alt="车队合影" class="team-photo-new">
        </div>
        <div class="intro-text-new">
          <h2 class="section-title-new">关于卧云车队</h2>
          <p class="intro-paragraph-new" style="color: white !important;">
            卧云车队成立于2021年，肇始于某郭姓男子组织的几次骑行活动，后由强者周开播发起组建。卧云车队是一支充满活力和激情的骑行团队。我们相信，每一次踩踏都是对生活的热爱，每一段路程都是心灵洗礼。
          </p>
          <p class="intro-paragraph-new" style="color: white !important;">
            我们不仅仅是一支骑行队伍，更是一个温暖的大家庭。在这里，你会遇到志同道合的朋友，分享骑行的快乐，探索未知的美景。
          </p>
          <div class="team-stats-new">
            <div class="stat-item-new">
              <div class="stat-number-new">20+</div>
              <div class="stat-label-new">队员</div>
            </div>
            <div class="stat-item-new">
              <div class="stat-number-new">30+</div>
              <div class="stat-label-new">活动</div>
            </div>
            <div class="stat-item-new">
              <div class="stat-number-new">5000+</div>
              <div class="stat-label-new">公里</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动事迹 -->
    <div class="activities-section fade-in-section" ref="activityRef">
      <h2 class="section-title-new text-center">活动事迹</h2>
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div class="timeline-item" v-for="(activity, index) in activities" :key="activity.id" :class="{ 'timeline-item-right': index % 2 === 1 }">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="activity-image">
              <img :src="activity.image" :alt="activity.name" class="activity-img">
            </div>
            <div class="activity-info">
              <h3 class="activity-name">{{ activity.name }}</h3>
              <p class="activity-date">{{ activity.date }}</p>
              <p class="activity-description">{{ activity.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- 品牌展示区域 -->
    <div class="brand-section fade-in-section" ref="brandRef">
      <div class="brand-content">
        <div class="brand-text">
          <h2 class="brand-title">征途无界</h2>
          <h3 class="brand-subtitle">探索无限</h3>
          <p class="brand-description">用车轮丈量世界的广阔，用心灵感受生命的深度</p>
          <!-- <div class="brand-keywords">
            <span class="keyword">专业</span>
            <span class="keyword">激情</span>
            <span class="keyword">探索</span>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Dual Carousel Section -->
    <div class="dual-carousel-section-new fade-in-section" ref="carouselRef">
      <h2 class="section-title-new text-center">精彩瞬间 & 热门路线</h2>
      <div class="dual-carousel-container-new">
        <!-- Highlights Carousel -->
        <div class="carousel-item-new">
          <el-carousel height="400px">
            <el-carousel-item v-for="item in highlights" :key="item.title">
              <img :src="item.img" :alt="item.title" class="carousel-img-new">
              <div class="carousel-caption-new">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <!-- Routes Carousel -->
        <div class="carousel-item-new">
          <el-carousel height="400px">
            <el-carousel-item v-for="item in routes" :key="item.title">
              <img :src="item.img" :alt="item.title" class="carousel-img-new">
              <div class="carousel-caption-new">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </div>

    <!-- Philosophy Section -->
    <div class="philosophy-section-new fade-in-section" ref="philosophyRef">
      <h2 class="section-title-new text-center">我们的骑行理念</h2>
      <div class="philosophy-grid-new">
        <div class="philosophy-item-new" v-for="item in philosophies" :key="item.title">
          <img :src="item.img" :alt="item.title" class="philosophy-img-new">
          <div class="philosophy-content-new">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Join Us Section -->
    <div class="join-section-new fade-in-section" ref="joinRef">
      <div class="join-content-new">
        <h2 class="section-title-new" style="color:white !important;">加入卧云车队</h2>
        <p class="join-subtitle-new">无论你是骑行新手还是资深车友，我们都欢迎你的加入</p>
        
        <!-- 团队特色 -->
       <!--  <div class="team-features">
          <div class="feature-item">
            <div class="feature-icon">🚴‍♂️</div>
            <h3>专业指导</h3>
            <p>资深车友带队，安全骑行技巧分享</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🌄</div>
            <h3>精选路线</h3>
            <p>探索最美风景，记录难忘时光</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">👥</div>
            <h3>友好社区</h3>
            <p>志同道合的伙伴，共同成长进步</p>
          </div>
        </div> -->

        <!-- 联系方式 -->
        <div class="contact-info">
          <h3 class="contact-title">联系我们</h3>
          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-label">QQ群：</span>
              <span class="contact-value">123456789</span>
            </div>
            <!-- <div class="contact-item">
              <span class="contact-label">活动时间：</span>
              <span class="contact-value">每周末 8:00-18:00</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">集合地点：</span>
              <span class="contact-value">市中心广场</span>
            </div> -->
          </div>
        </div>

        <!-- 社交媒体链接 -->
        <div class="social-section">
          <h3 class="social-title">关注我们</h3>
          <div class="social-links">
            <a href="#" class="social-link wechat-link" title="微信公众号">
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.416 6.585 0 1.775 1.474 2.789 3.868 1.932 6.446a5.862 5.862 0 0 0 2.837-.403.864.864 0 0 1 .717.098l1.903 1.114a.326.326 0 0 0 .167.054c.16 0 .29-.132.29-.295 0-.072-.029-.143-.048-.213l-.39-1.48a.59.59 0 0 1 .213-.665C22.83 13.733 24 11.742 24 9.53c0-4.054-3.891-7.342-8.691-7.342-1.785 0-3.433.484-4.809 1.312C9.524 2.672 8.691 2.188 8.691 2.188z"/>
              </svg>
              <span>微信公众号</span>
            </a>
            <a href="#" class="social-link bilibili-link" title="Bilibili">
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .356-.124.657-.373.906l-1.174 1.12zM6.4 15.64h2.747v2.747H6.4zm8.853 0h2.747v2.747H15.253zm-4.267-8.533h2.027c.356 0 .653.124.893.373.24.249.36.551.36.907v4.267c0 .355-.12.658-.36.907-.24.249-.537.373-.893.373H10.986c-.356 0-.653-.124-.893-.373-.24-.249-.36-.552-.36-.907V8.387c0-.356.12-.658.36-.907.24-.249.537-.373.893-.373z"/>
              </svg>
              <span>Bilibili</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <el-footer class="footer">
      <p class="footer-text">© 2025 卧云车队 | 行者至千里，卧云看浮沉</p>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import '../style/HomeView.css';
import '../style/header.css';
import { ElCarousel, ElCarouselItem, ElButton, ElMessage } from 'element-plus';
import 'element-plus/es/components/carousel/style/css';
import 'element-plus/es/components/carousel-item/style/css';
import 'element-plus/es/components/button/style/css';

const activeMenu = ref("1");
const isHeaderVisible = ref(true);
let lastScrollTop = 0;
const homeRef = ref<HTMLElement | null>(null);
const heroSectionRef = ref<HTMLElement | null>(null);
const introRef = ref<HTMLElement | null>(null);
const activityRef = ref<HTMLElement | null>(null);
const carouselRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLElement | null>(null);
const brandRef = ref<HTMLElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const philosophyRef = ref<HTMLElement | null>(null);
const joinRef = ref<HTMLElement | null>(null);



const highlights = ref([
  {
    img:'Woyun_Web/imagines/carousel/new1.jpg',
    title: '城市骑行',
    description: '穿梭在城市的大街小巷，感受都市的脉搏'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/carousel/new3.jpg',
    title: '团队合影',
    description: '记录每一次出行，留下美好回忆'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/carousel/new2.jpg',
    title: '自然风光',
    description: '远离喧嚣，拥抱大自然的怀抱'
  }
]);

const routes = ref([
  {
    img: import.meta.env.BASE_URL + 'imagines/history/c1.jpg',
    title: '山地挑战线',
    description: '征服起伏山路，挑战自我极限'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/history/c2.jpg',
    title: '湖畔休闲线',
    description: '沿湖而行，享受宁静美景'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/history/c3.jpg',
    title: '乡村探索线',
    description: '穿越田野乡间，体验淳朴风情'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/history/c4.jpg',
    title: '城际连接线',
    description: '连接城市之间，开启长途骑行'
  }
]);

const philosophies = ref([
  {
    img: import.meta.env.BASE_URL + 'imagines/philosophy/微信图片_20250919145702_94_51.jpg',
    title: '安全第一',
    description: '每次骑行都严格遵守交通规则，佩戴安全装备，确保每位队员的安全。'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/philosophy/微信图片_20250919145704_95_51.jpg',
    title: '团队协作',
    description: '相互帮助，共同进步，没有人会被落下，我们一起到达终点。'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/philosophy/微信图片_20250919145706_96_51.jpg',
    title: '环保出行',
    description: '用自行车代替机动车，为环保贡献一份力量，保护我们美丽的地球。'
  },
  {
    img: import.meta.env.BASE_URL + 'imagines/philosophy/微信图片_20250919145718_97_51.jpg',
    title: '挑战自我',
    description: '不断突破自己的极限，在骑行中发现更强大的自己。'
  }
]);

const activities = ref([
  {
    id: 1,
    name: '散旦镇探险',
    date: '2021年2月',
    description: '探寻陌生路线，战胜泥泞山险',
    image: import.meta.env.BASE_URL + 'imagines/1.jpg'
  },
  {
    id: 2,
    name: '团结乡骑游',
    date: '我怎么记得',
    description: '团结乡游乐骑行，激发骑行激情。',
    image: import.meta.env.BASE_URL + 'imagines/2.jpg'
  },
  {
    id: 3,
    name: '初登卧云山',
    date: '2021年4月',
    description: '郭周金三人首次攀登卧云山，成功登顶。',
    image: import.meta.env.BASE_URL + 'imagines/3.jpg'
  },
  {
    id: 4,
    name: '"阳康"后首次换滇',
    date: '2023年1月',
    description: '病体初愈，车队几人相约环滇复建。',
    image: import.meta.env.BASE_URL + 'imagines/4.jpg'
  },
  {
    id: 5,
    name: '昆明弥勒大环线',
    date: '2023年2月',
    description: '冬季严寒天气下骑行，昆明至弥勒。',
    image: import.meta.env.BASE_URL + 'imagines/5.jpg'
  },
  {
    id: 6,
    name: '卧云山朝圣',
    date: '2023年4月',
    description: '车队骑行活动人数至多之行，二登卧云山',
    image: import.meta.env.BASE_URL + 'imagines/6.jpg'
  }
]);

const handleMenuSelect = (key: string) => {
  activeMenu.value = key;
  // 路由跳转逻辑
  if (key === '2-2') {
    // 车队成员页面
    window.location.href = '/team-member';
  } else if (key === '3') {
    // 骑行路线页面
    window.location.href = '/routes';
  }else if (key === '4') {
    //提示待开发
    ElMessage({
      message: '待开发ing',
      type: 'info',
    });
  } else if (key === '5') {
    // 卧云社区页面
    window.location.href = '/community';
  }
};

const handleScroll = () => {
  const st = document.body.scrollTop;
  if (st > lastScrollTop) {
    // 向下滚动
    isHeaderVisible.value = false;
  } else {
    // 向上滚动
    isHeaderVisible.value = true;
  }
  lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
};

// 满屏动画观察器
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
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // 观察所有需要动画的元素
  const elementsToObserve = [
    introRef.value,
    activityRef.value,
    carouselRef.value,
    brandRef.value,
    philosophyRef.value,
    joinRef.value
  ];

  elementsToObserve.forEach((el) => {
    if (el) {
      observer.observe(el);
    }
  });
};

onMounted(() => {
  document.body.addEventListener('scroll', handleScroll);
  // 延迟初始化观察器，等待DOM完全加载
  setTimeout(() => {
    observeElements();
  }, 100);
});

onUnmounted(() => {
  document.body.removeEventListener('scroll', handleScroll);
});
</script>