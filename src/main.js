// main.js - UniApp 应用入口
// 技术栈：Vue3 + Pinia + 纯本地存储
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 注册 Pinia 状态管理
  const pinia = createPinia()
  app.use(pinia)
  
  return {
    app
  }
}
