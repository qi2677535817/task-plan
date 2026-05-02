import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

// https://uniapp.dcloud.net.cn/collocation/vite-config.html
export default defineConfig({
  plugins: [
    uni()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // H5 开发时的服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})
