<template>
  <div class="rightPane">
    <div :style="{ color: stripColor }" class="title">{{ card.name.toUpperCase() }}</div>
    <div ref="underline" :style="{ borderTopColor: stripColor }" class="underline"></div>
    <div :style="{ background: metaColor }" class="meta-bg"></div>
    <div class="meta-text">
      <strong style="font-style:normal;font-weight:600">{{ card.group }}</strong> · {{ card.type }}
    </div>
    <div class="body">
      <div class="sec">
        <h6 :style="{ color: stripColor }">WHEN:</h6>
        <p>{{ card.when }}</p>
      </div>
      <div class="sec">
        <h6 :style="{ color: stripColor }">TARGET:</h6>
        <p>{{ card.target }}</p>
      </div>
      <div class="sec">
        <h6 :style="{ color: stripColor }">EFFECT:</h6>
        <p>{{ card.effect }}</p>
      </div>
      <div v-if="card.restrictions" class="sec">
        <h6 :style="{ color: stripColor }">RESTRICTIONS:</h6>
        <p>{{ card.restrictions }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import type {CardData} from '../types'

defineProps<{ card: CardData, stripColor: string, metaColor: string }>()
const emit = defineEmits<{ (e: 'underline', y: number): void }>()
const underline = ref<HTMLElement | null>(null)

function calcUnderlineY() {
  if (!underline.value) return
  const el = underline.value
  const cardEl = el.closest('.card') as HTMLElement | null
  if (!cardEl) return
  const r = el.getBoundingClientRect()
  const cr = cardEl.getBoundingClientRect()
  emit('underline', r.top - cr.top)
}

const onResize = () => calcUnderlineY()
onMounted(async () => {
  await nextTick();
  calcUnderlineY();
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>
