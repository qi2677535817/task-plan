<template>
  <view class="modal-overlay" @click.self="$emit('close')">
    <view class="modal-sheet">
      <!-- 拖拽指示条 -->
      <view class="modal-handle"></view>

      <!-- 标题 -->
      <text class="modal-title">✎ 记一笔</text>

      <!-- 任务名称 -->
      <view class="field">
        <text class="field-label">任务</text>
        <input
          class="field-input"
          v-model="title"
          placeholder="今天想做什么？"
          placeholder-class="input-placeholder"
          maxlength="50"
          focus
        />
      </view>

      <!-- 备注 -->
      <view class="field">
        <text class="field-label">备注 <text class="field-optional">可选</text></text>
        <input
          class="field-input"
          v-model="desc"
          placeholder="添加一些细节…"
          placeholder-class="input-placeholder"
          maxlength="100"
        />
      </view>

      <!-- 优先级选择 -->
      <view class="field">
        <text class="field-label">优先程度</text>
        <PriorityPicker v-model="priority" />
      </view>

      <!-- 按钮组 -->
      <view class="modal-actions">
        <view class="btn btn-cancel" @click="$emit('close')" hover-class="btn-cancel-hover">
          取消
        </view>
        <view
          class="btn btn-submit"
          :class="{ 'btn-disabled': !title.trim() }"
          @click="onSubmit"
          hover-class="btn-submit-hover"
        >
          种植 🌱
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import PriorityPicker from './PriorityPicker.vue'

const emit = defineEmits(['close', 'submit'])

const title = ref('')
const desc = ref('')
const priority = ref(3)

function onSubmit() {
  if (!title.value.trim()) return
  emit('submit', {
    title: title.value,
    desc: desc.value,
    priority: priority.value
  })
}
</script>

<style lang="scss">
@import '@/uni.scss';

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(61, 53, 41, 0.35);  // 暖棕遮罩
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 480px;
  background: #FFFAF5;  // 暖白
  border-radius: $radius-xl $radius-xl 0 0;
  padding: 0 $spacing-xl $spacing-4xl;
  border: 1px solid $border-subtle;
  border-bottom: none;
  box-shadow: none;
}

.modal-handle {
  width: 36px;
  height: 4px;
  background: $border-strong;
  border-radius: 2px;
  margin: $spacing-md auto $spacing-2xl;
}

.modal-title {
  font-family: $font-heading;
  font-size: 22px;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-2xl;
  font-style: italic;
}

/* ---- 表单 ---- */
.field {
  margin-bottom: $spacing-xl;
}

.field-label {
  font-size: $text-sm;
  color: $text-secondary;
  font-weight: 500;
  display: block;
  margin-bottom: $spacing-sm;
}

.field-optional {
  font-size: $text-xs;
  color: $text-dim;
  font-weight: 400;
}

.field-input {
  width: 100%;
  height: 46px;
  background: rgba(255, 250, 245, 0.6);
  border: 1px solid $border-default;
  border-radius: $radius-sm;
  padding: 0 $spacing-lg;
  font-size: $text-base;
  color: $text-primary;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: $brand-primary;
  }
}

.input-placeholder {
  color: $text-dim;
  font-size: $text-base;
}

/* ---- 按钮组 ---- */
.modal-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-3xl;
}

.btn {
  flex: 1;
  height: 46px;
  border-radius: $radius-sm;
  @include flex-center;
  font-size: $text-base;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: rgba(197, 186, 165, 0.2);
  color: $text-secondary;
  border: 1px solid $border-default;
}

.btn-cancel-hover {
  opacity: 0.7;
}

.btn-submit {
  background: $brand-primary;
  color: #FFFFFF;
  border: 1px solid rgba(255,255,255,0.1);

  &.btn-disabled {
    background: rgba($brand-primary, 0.4);
    border-color: transparent;
  }
}

.btn-submit-hover {
  opacity: 0.85;
}
</style>
