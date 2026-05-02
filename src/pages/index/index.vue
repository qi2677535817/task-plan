<template>
  <view class="page-index">
    <!-- ====== Hero 头部 — 暖米白手账感 ====== -->
    <view class="hero">
      <view class="hero-inner">
        <view class="hero-brand">
          <text class="logo-icon">✦</text>
          <view class="logo-text-group">
            <text class="logo-text">TaskPlan</text>
            <text class="logo-sub">七日手账</text>
          </view>
        </view>
        <view class="hero-date-row">
          <text class="hero-date">{{ todayStr }}</text>
          <view class="hero-plant">🌿</view>
        </view>
      </view>
    </view>

    <!-- ====== 统计三连卡（大地色系）====== -->
    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-num ochre">{{ taskStore.homeTasks.length }}</text>
        <text class="stat-label">首页</text>
      </view>
      <view class="stat-card">
        <text class="stat-num brown">{{ taskStore.hiddenCount }}</text>
        <text class="stat-label">归档</text>
      </view>
      <view class="stat-card">
        <text class="stat-num green">{{ taskStore.completedCount }}</text>
        <text class="stat-label">完成 ✦</text>
      </view>
    </view>

    <!-- ====== 进度条 ====== -->
    <view class="progress-section" v-if="taskStore.homeTasks.length > 0">
      <view class="progress-header">
        <text class="progress-label">⏳ 今日进度</text>
        <text class="progress-pct">{{ progressPct }}%</text>
      </view>
      <view class="progress-track">
        <view
          class="progress-fill"
          :style="{ width: progressPct + '%' }"
        ></view>
      </view>
    </view>

    <!-- ====== 任务列表 ====== -->
    <view class="task-section">
      <view class="section-header">
        <text class="section-title">📋 重点任务</text>
        <view class="section-badge-row">
          <text class="section-badge">{{ taskStore.homeTasks.length }}/7</text>
          <text v-if="taskStore.hiddenCount > 0" class="section-archived"
            >归档 {{ taskStore.hiddenCount }}</text
          >
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="taskStore.homeTasks.length === 0">
        <view class="empty-box">
          <text class="empty-icon">🌱</text>
          <text class="empty-title">今天还没有任务</text>
          <text class="empty-desc">点击下方按钮，种下一颗任务种子</text>
        </view>
      </view>

      <!-- 任务卡片列表 -->
      <TaskCard
        v-for="task in sortedHomeTasks"
        :key="task.id"
        :task="task"
        @toggle="handleToggle(task.id)"
        @delete="handleDelete(task.id)"
        @toggle-hidden="taskStore.moveToHidden(task.id)"
      />
    </view>

    <!-- ====== FAB 添加按钮 — 暖色 ====== -->
    <view class="fab" @click="showAddModal = true" hover-class="fab-hover">
      <text class="fab-icon">✦</text>
      <text class="fab-text">记一笔</text>
    </view>

    <!-- ====== 添加任务弹窗 ====== -->
    <AddTaskModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @submit="handleAddTask"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskCard from '@/components/TaskCard.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'

const taskStore = useTaskStore()
const showAddModal = ref(false)

// 今日日期
const todayStr = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
})

// 首页未完成数（用于进度条）
const homeActive = computed(() =>
  taskStore.homeTasks.filter(t => !t.completed).length
)
const homeCompletedCount = computed(() =>
  taskStore.homeTasks.filter(t => t.completed).length
)

// 进度百分比
const progressPct = computed(() => {
  const total = taskStore.homeTasks.length
  if (total === 0) return 0
  return Math.round((homeCompletedCount.value / total) * 100)
})

// 首页按优先级排序
const sortedHomeTasks = computed(() =>
  [...taskStore.homeTasks].sort(
    (a, b) => b.priority - a.priority || a.createdAt - b.createdAt
  )
)

// ---- 操作方法 ----
function handleToggle(id) {
  const task = taskStore.tasks.find(t => t.id === id)
  if (!task) return
  // 只有从未完成→完成时需要确认
  if (!task.completed) {
    uni.showModal({
      title: '确认完成',
      content: `标记「${task.title}」为已完成？`,
      confirmText: '完成',
      confirmColor: '#C67C4E',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) taskStore.toggleComplete(id)
      }
    })
  } else {
    // 取消完成无需确认
    taskStore.toggleComplete(id)
  }
}

function handleDelete(id) {
  uni.showModal({
    title: '删除任务',
    content: '确认删除这条任务？',
    confirmText: '删除',
    confirmColor: '#C67C4E',
    success: (res) => {
      if (res.confirm) taskStore.deleteTask(id)
    }
  })
}

function handleAddTask({ title, desc, priority }) {
  if (!title.trim()) return
  taskStore.addTask({ title: title.trim(), desc: desc.trim(), priority })
  showAddModal.value = false
}
</script>

<style lang="scss">
@import '@/uni.scss';

.page-index {
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 110px;
}

/* ===== Hero — 暖米白渐变 ===== */
.hero {
  padding: 48px $spacing-xl 0;
  margin-bottom: $spacing-xl;
  background: linear-gradient(180deg, #EDE6DB 0%, $bg-main 100%);
  padding-bottom: $spacing-xl;
}

.hero-inner {
  @include flex-col;
  gap: 6px;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.logo-icon {
  font-size: 24px;
  color: $brand-primary;
}

.logo-text-group {
  @include flex-col;
  gap: 0;
}

.logo-text {
  font-family: $font-heading;
  font-size: 28px;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: -0.3px;
  font-style: italic;
}

.logo-sub {
  font-family: $font-body;
  font-size: $text-xs;
  color: $text-muted;
  letter-spacing: 1.5px;
}

.hero-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.hero-date {
  font-size: $text-sm;
  color: $text-muted;
  font-weight: 400;
}

.hero-plant {
  font-size: 18px;
}

/* ===== 统计三连（大地色·无阴影） ===== */
.stats-row {
  display: flex;
  gap: $spacing-sm;
  padding: 0 $spacing-xl;
  margin-bottom: $spacing-lg;
  margin-top: -8px;
}

.stat-card {
  flex: 1;
  background: $bg-surface;
  border: 1px solid $border-default;
  border-radius: $radius-sm;
  padding: $spacing-lg $spacing-md;
  text-align: center;
  box-shadow: none;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  font-family: $font-heading;
  display: block;
  line-height: 1.3;
  font-style: italic;

  &.ochre { color: $brand-primary; }
  &.green { color: $brand-secondary; }
  &.brown { color: $text-secondary; }
}

.stat-label {
  font-size: $text-xs;
  color: $text-dim;
  display: block;
  margin-top: 2px;
}

/* ===== 进度条（苔藓绿） ===== */
.progress-section {
  padding: 0 $spacing-xl;
  margin-bottom: $spacing-xl;
}

.progress-header {
  @include flex-between;
  margin-bottom: 6px;
}

.progress-label {
  font-size: $text-xs;
  color: $text-secondary;
}

.progress-pct {
  font-size: $text-xs;
  color: $brand-secondary;
  font-weight: 600;
  font-family: $font-mono;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba($border-strong, 0.25);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $brand-primary, $brand-secondary);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* ===== 任务列表 ===== */
.task-section {
  padding: 0 $spacing-xl;
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $text-base;
  font-weight: 600;
  color: $text-primary;
  font-family: $font-body;
}

.section-badge-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.section-badge {
  font-size: $text-xs;
  color: $text-secondary;
  font-family: $font-mono;
  background: $bg-surface;
  padding: 3px 10px;
  border-radius: 10px;
  border: 1px solid $border-default;
}

.section-archived {
  font-size: $text-xs;
  color: $text-muted;
}

/* ===== 空状态 ===== */
.empty-state {
  padding: 0;
}

.empty-box {
  text-align: center;
  padding: 50px 20px;
  background: $bg-surface;
  border: 1px dashed $border-strong;
  border-radius: $radius-sm;
  box-shadow: none;
}

.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: $spacing-lg;
}

.empty-title {
  font-size: $text-base;
  color: $text-secondary;
  font-weight: 500;
  display: block;
  margin-bottom: $spacing-sm;
}

.empty-desc {
  font-size: $text-sm;
  color: $text-dim;
  display: block;
}

/* ===== FAB 添加按钮（暖色·无阴影） ===== */
.fab {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: $brand-primary;
  color: #FFFFFF;
  padding: 14px 28px;
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: none;
  z-index: 100;
  transition: all 0.2s ease;
}

.fab-hover {
  opacity: 0.85;
  transform: translateX(-50%) scale(0.97);
}

.fab-icon {
  font-size: 18px;
  line-height: 1;
}

.fab-text {
  font-size: $text-base;
  font-weight: 500;
}
</style>
