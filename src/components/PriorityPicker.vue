<template>
  <view class="picker-row">
    <view
      v-for="p in levels"
      :key="p.value"
      class="picker-item"
      :class="{ 'is-active': modelValue === p.value }"
      @click="$emit('update:modelValue', p.value)"
    >
      <view class="p-color-dot" :style="{ background: p.color }"></view>
      <view class="p-info">
        <text class="p-label">{{ p.label }}</text>
        <text class="p-hint">{{ p.hint }}</text>
      </view>
      <view class="p-check" v-if="modelValue === p.value">
        <text class="p-check-icon">✦</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 3 }
})

defineEmits(['update:modelValue'])

const levels = [
  { value: 5, label: '✦ 重要',        hint: '今天必须完成', color: '#C67C4E' },
  { value: 4, label: '✦ 优先',        hint: '尽快处理',      color: '#D4956B' },
  { value: 3, label: '✦ 常规',        hint: '按计划进行',    color: '#7A9C6B' },
  { value: 2, label: '✦ 待办',        hint: '有空再做',      color: '#9EAD7A' },
  { value: 1, label: '✦ 备忘',        hint: '可做可不做',    color: '#C5BAA5' }
]
</script>

<style lang="scss">
@import '@/uni.scss';

.picker-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  background: rgba(255, 250, 245, 0.6);
  border: 1px solid $border-default;
  border-radius: $radius-sm;
  transition: all 0.15s ease;

  &.is-active {
    background: rgba($brand-primary, 0.06);
    border-color: $brand-primary;
  }
}

.p-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.p-info {
  flex: 1;
  @include flex-col;
  gap: 1px;
}

.p-label {
  font-size: $text-base;
  color: $text-primary;
  font-weight: 500;
}

.p-hint {
  font-size: $text-xs;
  color: $text-dim;
}

.p-check {
  width: 22px;
  height: 22px;
  border-radius: $radius-full;
  background: $brand-primary;
  @include flex-center;
}

.p-check-icon {
  color: #FFFFFF;
  font-size: 11px;
}
</style>
