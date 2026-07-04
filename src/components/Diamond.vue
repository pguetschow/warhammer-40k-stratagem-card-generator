<template>
  <div :class="['diamond', `diamond--${shape}`, { cp: isCp }]" :style="{ borderColor: color }">
    <div class="iconWrap">
      <slot/>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = withDefaults(defineProps<{ color: string, isCp?: boolean, shape?: 'up' | 'down' | 'diamond' }>(), {
  shape: 'down',
})
</script>
