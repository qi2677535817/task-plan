<template>
  <view class="app-wrapper">
    <slot />
  </view>
</template>

<script setup>
// TaskPlan 根组件 - 暖米白手账风格
</script>

<style lang="scss">
/* ===== 全局基础样式 ===== */
page {
  font-family: $font-body;
  color: $text-primary;
  background-color: $bg-main;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // 禁止选中
  -webkit-user-select: none;
  user-select: none;
}

/* ===== 滚动条美化 ===== */
::-webkit-scrollbar {
  width: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: $border-strong;
  border-radius: 3px;
}

/* ===== 按钮统一样式 ===== */
button::after {
  border: none;
}

/* ===== 触摸反馈 ===== */
view[hover-class*="hover"] {
  transition: background 0.2s ease, opacity 0.2s ease;
}
</style>
