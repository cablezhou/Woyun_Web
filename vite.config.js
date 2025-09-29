import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/Woyun_Web/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        404: './404.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    // 允许所有主机访问（适合临时测试）
    //allowedHosts: ['all']
    // 或者只允许当前localtunnel生成的域名
     allowedHosts: ['meaning-formation-arab-mountains.trycloudflare.com'],
     
    // 注释掉代理配置，因为现在直接使用ngrok URL
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false,
    //     // 保留原始路径
    //     rewrite: (path) => path
    //   }
    // }
  }
})
