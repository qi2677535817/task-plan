<template>
  <!--
    TaskCard 任务卡片
    手账风 · 大地色优先级 · 植物图标
  -->
  <view
    class="task-card"
    :class="[`priority-p${task.priority}`, { 'is-completed': task.completed }]"
    :style="cardOpacityStyle"
    hover-class="card-hover"
    @tap="onToggle"
  >
    <!-- 左侧：勾选框（完成 = 苔藓绿叶） -->
    <view class="card-check" @tap.stop="onToggle">
      <view v-if="task.completed" class="check-icon checked">🌿</view>
      <view v-else class="check-icon unchecked"></view>
    </view>

    <!-- 中间：任务内容 -->
    <view class="card-body">
      <text class="card-title">{{ task.title }}</text>
      <text v-if="task.desc" class="card-desc">{{ task.desc }}</text>
      <view class="card-meta">
        <text class="priority-label">✦ {{ priorityText }}</text>
        <text class="card-time">{{ formattedTime }}</text>
      </view>
    </view>

    <!-- 右侧：操作按钮 -->
    <view class="card-actions">
      <!-- 移入隐藏 / 调度回首页 -->
      <text
        v-if="!task.completed"
        class="action-btn hide-btn"
        @tap.stop="onToggleHidden"
      >{{ task.hidden ? '📋' : '📁' }}</text>
      <!-- 删除 -->
      <text
        class="action-btn delete-btn"
        @tap.stop="onDelete"
      >✕</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: { type: Object, required: true }
})
const emit = defineEmits(['toggle', 'delete', 'toggle-hidden'])

const priorityMap = ['', '备忘', '待办', '常规', '优先', '重要']
const priorityText  = computed(() => priorityMap[props.task.priority] || `P${props.task.priority}`)

// 优先级透明度：P5 = 1.0(100%), P4=0.9, P3=0.8, P2=0.7, P1=0.6
const opacityLevels = { 5: 1, 4: 0.9, 3: 0.8, 2: 0.7, 1: 0.6 }
const cardOpacityStyle = computed(() => {
  if (props.task.completed) return 'opacity: 0.75'  // 已完成用固定半透明
  const opacity = opacityLevels[props.task.priority] ?? 0.8
  return `opacity: ${opacity}`
})

const formattedTime = computed(() => {
  const d = new Date(props.task.createdAt || Date.now())
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}/${day} ${h}:${min}`
})

function onToggle() { emit('toggle', props.task.id) }
function onDelete() { emit('delete', props.task.id) }
function onToggleHidden() { emit('toggle-hidden', props.task.id) }
</script>

<style lang="scss" scoped>
/* ============================
   TaskCard — 手账风格任务卡片
   ============================ */

.task-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg $spacing-md;
  margin-bottom: $spacing-sm;
  background: $bg-surface;
  border: 1px solid $border-default;
  border-radius: $radius-sm;
  transition: opacity 0.3s ease, border-color 0.3s ease;

  // 优先级左侧指示条 — 赭橙/苔藓/鼠尾草
  &.priority-p5 { border-left: 3px solid $priority-5; background: $priority-bg-5; }
  &.priority-p4 { border-left: 3px solid $priority-4; background: $priority-bg-4; }
  &.priority-p3 { border-left: 3px solid $priority-3; background: $priority-bg-3; }
  &.priority-p2 { border-left: 3px solid $priority-2; background: $priority-bg-2; }
  &.priority-p1 { border-left: 3px solid $priority-1; }
}

.card-hover {
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

/* 已完成 — 苔藓绿点缀行 + 半透明 */
.is-completed {
  opacity: 0.75;
  border-left-color: $success;
  .card-title { text-decoration: line-through; color: $text-muted; }
  .card-desc { color: $text-dim; }
  .priority-label { color: $text-dim; }
  .check-icon.checked { opacity: 0.5; }
}

/* ===== 勾选框 ===== */
.card-check {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  @include flex-center;
}

.check-icon {
  width: 24px;
  height: 24px;
  border-radius: $radius-full;
  @include flex-center;
  font-size: 14px;

  &.unchecked {
    border: 1.5px solid $border-strong;
    background: rgba(255,252,246,0.5);
  }

  &.checked {
    background: rgba($success, 0.12);
    border: 1px solid $success;
  }
}

/* ===== 任务内容 ===== */
.card-body {
  flex: 1;
  min-width: 0;
  @include flex-col;
  gap: 2px;
}

.card-title {
  font-family: $font-body;
  font-size: $text-base;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: 2px;
}

.priority-label {
  font-size: $text-xs;
  color: $text-secondary;
  letter-spacing: 0.3px;
}

.card-time {
  font-size: $text-2xs;
  color: $text-dim;
  font-family: $font-mono;
}

/* ===== 操作按钮 ===== */
.card-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: $radius-full;
  @include flex-center;
  font-size: 14px;
  transition: background 0.2s ease;
}

.hide-btn {
  background: rgba($brand-primary, 0.08);
  &:active { background: rgba($brand-primary, 0.18); }
}

.delete-btn {
  background: rgba($brand-primary, 0.08);
  color: $brand-accent;
  font-size: 11px;
  font-weight: 700;
  &:active { background: rgba($brand-accent, 0.18); }
}
</style>
