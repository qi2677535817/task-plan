// ============================================================
// stores/task.js - 任务状态管理（Pinia）
// 核心职责：
//   1. 管理所有任务数据的增删改查
//   2. 自动持久化到 uni.setStorageSync 本地缓存
//   3. 提供首页 7 任务排序、隐藏列表分片等计算属性
// 数据格式：
//   {
//     id: string,          // 唯一标识（时间戳）
//     title: string,       // 任务标题
//     priority: 1|2|3|4|5, // 优先级（1最低，5最高）
//     completed: boolean,  // 是否完成
//     status: 'home'|'hidden', // 在首页还是隐藏列表
//     createdAt: number    // 创建时间戳
//   }
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 本地存储 Key
const STORAGE_KEY = 'TASKPLAN_TASKS'

export const useTaskStore = defineStore('task', () => {
  // ==================== 状态 ====================
  
  /** 所有任务原始数据 */
  const tasks = ref([])

  // ==================== 初始化 ====================

  /** 从本地缓存加载任务数据 */
  function loadFromStorage() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY)
      if (stored) {
        tasks.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载任务数据失败:', e)
      tasks.value = []
    }
  }

  /** 保存任务数据到本地缓存 */
  function saveToStorage() {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(tasks.value))
    } catch (e) {
      console.error('保存任务数据失败:', e)
      uni.showToast({
        title: '数据保存失败',
        icon: 'none'
      })
    }
  }

  // 启动时立即加载数据
  loadFromStorage()

  // ==================== 计算属性 ====================

  /**
   * 首页任务列表（最多 7 个）
   * 筛选 status='home' 的任务，按优先级从高到低排序
   */
  const homeTasks = computed(() => {
    return tasks.value
      .filter(t => t.status === 'home')
      .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
      .slice(0, 7)
  })

  /**
   * 隐藏任务列表
   * 筛选 status='hidden' 的任务，按创建时间倒序
   */
  const hiddenTasks = computed(() => {
    return tasks.value
      .filter(t => t.status === 'hidden')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  /**
   * 首页当前任务数
   */
  const homeCount = computed(() => {
    return tasks.value.filter(t => t.status === 'home').length
  })

  /**
   * 首页是否已满（>= 7 个）
   */
  const isHomeFull = computed(() => {
    return homeCount.value >= 7
  })

  /**
   * 隐藏任务数量
   */
  const hiddenCount = computed(() => {
    return tasks.value.filter(t => t.status === 'hidden').length
  })

  /**
   * 总任务数
   */
  const totalCount = computed(() => {
    return tasks.value.length
  })

  /**
   * 已完成任务数
   */
  const completedCount = computed(() => {
    return tasks.value.filter(t => t.completed).length
  })

  /**
   * 各优先级对应的任务数
   */
  const priorityCounts = computed(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    tasks.value.forEach(t => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++
      }
    })
    return counts
  })

  // ==================== 操作方法 ====================

  /**
   * 添加新任务
   * @param {object|string} input - 任务数据对象 { title, desc, priority } 或标题字符串（向后兼容）
   * @param {number} [priority] - 若 input 为字符串时的优先级
   * @returns {object} 新创建的任务对象
   */
  function addTask(input, priority = 3) {
    // 兼容两种调用方式：addTask('标题') 或 addTask({ title, desc, priority })
    const title = typeof input === 'string' ? input : (input?.title || '')
    const desc = typeof input === 'object' ? (input?.desc || '') : ''
    const p = typeof input === 'object' ? (input?.priority ?? 3) : priority
    
    if (!title.trim()) return null

    // 自动判断：如果首页已满，新任务默认归入隐藏列表
    const defaultStatus = isHomeFull.value ? 'hidden' : 'home'

    const now = Date.now()
    const newTask = {
      id: `task_${now}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      desc: desc.trim(),
      priority: Math.max(1, Math.min(5, Math.round(p))),
      completed: false,
      status: defaultStatus,
      createdAt: now
    }
    
    tasks.value.unshift(newTask)
    saveToStorage()
    
    // 提示用户任务去向
    if (defaultStatus === 'hidden') {
      uni.showToast({
        title: '首页已满，已归入隐藏列表',
        icon: 'none',
        duration: 2000
      })
    }
    
    return newTask
  }

  /**
   * 切换任务完成状态
   * @param {string} id - 任务 ID
   */
  function toggleComplete(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      saveToStorage()
    }
  }

  /**
   * 删除任务
   * @param {string} id - 任务 ID
   */
  function deleteTask(id) {
    // 二次确认（通过返回布尔值让组件决定是否弹窗）
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value.splice(idx, 1)
      saveToStorage()
      return true
    }
    return false
  }

  /**
   * 把首页任务移入隐藏列表
   * @param {string} id - 任务 ID
   */
  function moveToHidden(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task && task.status === 'home') {
      task.status = 'hidden'
      saveToStorage()
    }
  }

  /**
   * 把隐藏任务调度到首页
   * @param {string} id - 任务 ID
   * @returns {boolean} 是否成功
   */
  function moveToHome(id) {
    if (isHomeFull.value) {
      uni.showToast({
        title: '首页已满（最多 7 个）',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    
    const task = tasks.value.find(t => t.id === id)
    if (task && task.status === 'hidden') {
      task.status = 'home'
      saveToStorage()
      return true
    }
    return false
  }

  /**
   * 修改任务标题
   * @param {string} id - 任务 ID
   * @param {string} newTitle - 新标题
   */
  function updateTitle(id, newTitle) {
    const task = tasks.value.find(t => t.id === id)
    if (task && newTitle.trim()) {
      task.title = newTitle.trim()
      saveToStorage()
    }
  }

  /**
   * 修改任务优先级
   * @param {string} id - 任务 ID
   * @param {number} priority - 新优先级 1~5
   */
  function updatePriority(id, priority) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.priority = Math.max(1, Math.min(5, Math.round(priority)))
      saveToStorage()
    }
  }

  /**
   * 清空所有已完成的隐藏任务
   */
  function clearCompletedHidden() {
    tasks.value = tasks.value.filter(
      t => !(t.status === 'hidden' && t.completed)
    )
    saveToStorage()
  }

  /**
   * 完全重置所有数据
   */
  function resetAllData() {
    tasks.value = []
    saveToStorage()
  }

  /**
   * 尝试把超额的首页任务自动归入隐藏（当首页 > 7 时）
   * 通常在外部操作可能导致首页超限时手动调用
   */
  function autoBalanceHomeTasks() {
    const homeList = tasks.value
      .filter(t => t.status === 'home')
      .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt)
    
    if (homeList.length > 7) {
      // 把超出且优先级最低的移入隐藏
      const toMove = homeList.slice(7)
      toMove.forEach(t => {
        const task = tasks.value.find(item => item.id === t.id)
        if (task) task.status = 'hidden'
      })
      saveToStorage()
    }
  }

  // ==================== 导出 ====================
  return {
    // 状态
    tasks,
    // 计算属性
    homeTasks,
    hiddenTasks,
    homeCount,
    isHomeFull,
    hiddenCount,
    totalCount,
    completedCount,
    priorityCounts,
    // 操作方法
    addTask,
    toggleComplete,
    deleteTask,
    moveToHidden,
    moveToHome,
    updateTitle,
    updatePriority,
    clearCompletedHidden,
    resetAllData,
    autoBalanceHomeTasks,
    loadFromStorage,
    saveToStorage
  }
})
