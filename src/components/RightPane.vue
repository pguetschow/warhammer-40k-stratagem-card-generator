<template>
  <div class="rightPane">
    <div :style="{ color: stripColor, fontSize: titleFontSize + 'px' }" class="title">
      <div class="title-main">
        <span class="title-text">{{ card.name.toUpperCase() }}</span>
        <span v-if="card.ref" class="title-ref">{{ card.ref }}</span>
      </div>
    </div>
    <div ref="underline" :style="{ borderTopColor: stripColor }" class="underline"></div>
    <template v-if="card.type">
      <div :style="{ background: metaColor }" class="meta-bg"></div>
      <div class="meta-text">
        <strong style="font-style:normal;font-weight:600">{{ card.type }}</strong>
      </div>
    </template>
    <div class="body">
      <p v-if="card.flavor" class="flavor" v-html="card.flavor"></p>
      <template v-if="card.sections?.length">
        <div v-for="section in card.sections" :key="section.label" class="sec">
          <h6 :style="{ color: stripColor }">{{ section.label }}</h6>
          <p v-html="section.html"></p>
        </div>
      </template>
      <template v-else>
        <div class="sec">
          <h6 :style="{ color: stripColor }">WHEN:</h6>
          <p v-html="card.when"></p>
        </div>
        <div class="sec">
          <h6 :style="{ color: stripColor }">TARGET:</h6>
          <p v-html="card.target"></p>
        </div>
        <div class="sec">
          <h6 :style="{ color: stripColor }">EFFECT:</h6>
          <p v-html="card.effect"></p>
        </div>
      </template>
      <div v-if="card.modes?.length" class="modes">
        <div
            v-for="(mode, index) in card.modes"
            :key="mode.name"
            :ref="(el) => setModeEl(mode, el)"
            :class="{ 'mode-extra-cp': mode.cpModifier }"
            class="mode"
        >
          <div class="mode-line">
            <span class="mode-bullet">▪</span>
            <span :style="{ background: metaColor }" class="mode-name">{{ mode.name }}:</span>
            <span v-html="mode.effect"></span>
          </div>
          <div v-if="index < card.modes.length - 1" class="mode-separator"></div>
        </div>
      </div>
      <div v-if="card.restrictions" class="sec">
        <h6 :style="{ color: stripColor }">RESTRICTIONS:</h6>
        <p v-html="card.restrictions"></p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue'
import type {ComponentPublicInstance} from 'vue'
import type {CardData} from '../types'

const props = defineProps<{ card: CardData, stripColor: string, metaColor: string }>()
const emit = defineEmits<{ (e: 'underline', y: number): void, (e: 'mode-cp-y', y: number | null): void }>()
const underline = ref<HTMLElement | null>(null)
let modeCpModifierEl: HTMLElement | null = null

function setModeEl(mode: { cpModifier?: number }, el: Element | ComponentPublicInstance | null) {
  if (mode.cpModifier) modeCpModifierEl = el as HTMLElement | null
}

function calcModeCpY() {
  if (!modeCpModifierEl) {
    emit('mode-cp-y', null)
    return
  }
  const cardEl = modeCpModifierEl.closest('.card') as HTMLElement | null
  if (!cardEl) return
  const r = modeCpModifierEl.getBoundingClientRect()
  const cr = cardEl.getBoundingClientRect()
  emit('mode-cp-y', r.top - cr.top)
}

// Calibrated for the title font (Arial Black / Archivo Black), which is a wide bold-condensed cut.
const MONO_CHAR_WIDTH_RATIO = 0.86
const TITLE_MAIN_BUDGET_PX = 124
const REF_FONT_PX = 9
const NAME_REF_GAP_PX = 6
const BASE_TITLE_FONT_PX = 14
const MIN_TITLE_FONT_PX = 6.5
const titleFontSize = computed(() => {
  const len = props.card.name.length
  const refWidth = props.card.ref ? props.card.ref.length * MONO_CHAR_WIDTH_RATIO * REF_FONT_PX + NAME_REF_GAP_PX : 0
  const nameBudget = TITLE_MAIN_BUDGET_PX - refWidth
  const neededAtBase = len * MONO_CHAR_WIDTH_RATIO * BASE_TITLE_FONT_PX
  if (neededAtBase <= nameBudget) return BASE_TITLE_FONT_PX
  return Math.max(MIN_TITLE_FONT_PX, nameBudget / (len * MONO_CHAR_WIDTH_RATIO))
})

function calcUnderlineY() {
  if (!underline.value) return
  const el = underline.value
  const cardEl = el.closest('.card') as HTMLElement | null
  if (!cardEl) return
  const r = el.getBoundingClientRect()
  const cr = cardEl.getBoundingClientRect()
  emit('underline', r.top - cr.top)
}

const onResize = () => {
  calcUnderlineY()
  calcModeCpY()
}
onMounted(async () => {
  await nextTick();
  calcUnderlineY();
  calcModeCpY();
  window.addEventListener('resize', onResize)
})
onUpdated(() => calcModeCpY())
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>
