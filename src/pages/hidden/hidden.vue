<template>
  <view class="page-hidden">
    <!-- ====== 头部 — 暖色归档 ====== -->
    <view class="hidden-hero">
      <view class="hidden-header">
        <view class="hidden-title-row">
          <text class="hidden-icon">📦</text>
          <text class="hidden-title">归档箱</text>
          <view class="hidden-badge">{{ hiddenTasks.length }}</view>
        </view>
        <text class="hidden-sub">首页满 7 个后，超出的任务自动归到这里</text>
      </view>
    </view>

    <!-- ====== 统计 + 批量清除 ====== -->
    <view class="hidden-ctrl" v-if="hiddenTasks.length > 0">
      <view class="ctrl-stats">
        <text class="ctrl-count">共 {{ hiddenTasks.length }} 项</text>
        <text class="ctrl-done" v-if="completedHidden > 0">
          🌿 已完成 {{ completedHidden }}
        </text>
      </view>
      <view
        class="ctrl-clear"
        @click="clearCompleted"
        v-if="completedHidden > 0"
        hover-class="ctrl-clear-hover"
      >
        <text class="ctrl-clear-icon">✕</text>
        <text class="ctrl-clear-text">清除已完成</text>
      </view>
    </view>

    <!-- ====== 任务列表 ====== -->
    <view class="task-list" v-if="hiddenTasks.length > 0">
      <TaskCard
        v-for="task in sortedHidden"
        :key="task.id"
        :task="task"
        @toggle="handleToggle(task.id)"
        @delete="handleDelete(task.id)"
        @toggle-hidden="taskStore.moveToHome(task.id)"
      />
    </view>

    <!-- ====== 空状态 ====== -->
    <view class="empty-state" v-else>
      <view class="empty-box">
        <text class="empty-icon">📭</text>
        <text class="empty-title">归档箱是空的</text>
        <text class="empty-desc">首页任务超过 7 个时，会自动归档到这里</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskCard from '@/components/TaskCard.vue'

const taskStore = useTaskStore()

const hiddenTasks = computed(() => taskStore.hiddenTasks)

const completedHidden = computed(() =>
  hiddenTasks.value.filter(t => t.completed).length
)

// 按优先级排序
const sortedHidden = computed(() =>
  [...hiddenTasks.value].sort((a, b) => b.priority - a.priority)
)

function handleToggle(id) {
  const task = taskStore.tasks.find(t => t.id === id)
  if (!task) return
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

function clearCompleted() {
  const completed = hiddenTasks.value.filter(t => t.completed)
  if (completed.length === 0) return
  uni.showModal({
    title: '清除已完成',
    content: `确认清除 ${completed.length} 个已完成任务？`,
    confirmText: '清除',
    confirmColor: '#C67C4E',
    success: (res) => {
      if (res.confirm) {
        completed.forEach(t => taskStore.deleteTask(t.id))
      }
    }
  })
}
</script>

<style lang="scss">
@import '@/uni.scss';

.page-hidden {
  min-height: 100vh;
  background: $bg-main;
  padding-bottom: 40px;
}

/* ===== 头部（暖色渐变） ===== */
.hidden-hero {
  padding: 32px $spacing-xl 0;
  margin-bottom: $spacing-xl;
  background: linear-gradient(180deg, #EDE6DB 0%, $bg-main 100%);
  padding-bottom: $spacing-xl;
}

.hidden-header {
  margin-bottom: $spacing-lg;
}

.hidden-title-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: 6px;
}

.hidden-icon {
  font-size: 20px;
}

.hidden-title {
  font-family: $font-heading;
  font-size: 24px;
  font-weight: 600;
  color: $text-primary;
  font-style: italic;
}

.hidden-badge {
  background: $bg-surface;
  color: $text-secondary;
  font-size: $text-xs;
  font-weight: 600;
  font-family: $font-mono;
  padding: 3px 10px;
  border-radius: 10px;
  border: 1px solid $border-default;
  margin-left: auto;
}

.hidden-sub {
  font-size: $text-sm;
  color: $text-dim;
}

/* ===== 控制栏 ===== */
.hidden-ctrl {
  padding: 0 $spacing-xl $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ctrl-stats {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.ctrl-count {
  font-size: $text-base;
  color: $text-primary;
  font-weight: 500;
}

.ctrl-done {
  font-size: $text-sm;
  color: $brand-secondary;
  background: rgba($brand-secondary, 0.08);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba($brand-secondary, 0.15);
}

.ctrl-clear {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  background: rgba($brand-primary, 0.08);
  border: 1px solid rgba($brand-primary, 0.15);
  border-radius: 8px;
  transition: all 0.15s ease;
}

.ctrl-clear-hover {
  opacity: 0.7;
}

.ctrl-clear-icon {
  font-size: 12px;
  color: $brand-primary;
  font-weight: bold;
}

.ctrl-clear-text {
  font-size: $text-xs;
  color: $brand-primary;
  font-weight: 500;
}

/* ===== 任务列表 ===== */
.task-list {
  padding: 0 $spacing-xl;
}

/* ===== 空状态 ===== */
.empty-state {
  padding: 0 $spacing-xl;
}

.empty-box {
  text-align: center;
  padding: 60px 20px;
  background: $bg-surface;
  border: 1px dashed $border-strong;
  border-radius: $radius-sm;
  box-shadow: none;
}

.empty-icon {
  font-size: 42px;
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
  line-height: 1.5;
}
</style>
