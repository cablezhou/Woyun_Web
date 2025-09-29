import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TeamMember from '../views/TeamMember.vue'
import Community from '../views/community.vue'
import PostDetail from '../views/PostDetail.vue'
import UserProfile from '../views/UserProfile.vue'
import CyclingRoutes from '../views/CyclingRoutes.vue'
import RouteDetail from '../views/RouteDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/team-member',
      name: 'teamMember',
      component: TeamMember
    },
    {
      path: '/community',
      name: 'community',
      component: Community
    },
    {
      path: '/community/post/:id',
      name: 'postDetail',
      component: PostDetail
    },
    {
      path: '/user/:id',
      name: 'userProfile',
      component: UserProfile
    },
    {
      path: '/routes',
      name: 'cyclingRoutes',
      component: CyclingRoutes
    },
    {
      path: '/routes/:id',
      name: 'routeDetail',
      component: RouteDetail
    },
  ]
})

export default router