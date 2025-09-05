<template>
  <div :class="{ cp: isCp }" :style="{ borderColor: color }" class="diamond">
    <div class="iconWrap">
      <slot/>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{ color: string, isCp?: boolean }>()
</script>
