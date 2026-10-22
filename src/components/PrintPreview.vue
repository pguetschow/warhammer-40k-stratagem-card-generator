<template>
  <div class="print:m-0 print:p-0">
    <div
        class="mt-6 mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-dotted border-[#8a8a86] paper-texture py-4 lg:sticky lg:top-0 lg:z-40 print:hidden"
    >
      <button :class="linkButtonClass" class="inline-flex items-center gap-1" type="button" @click="$emit('close')">
        <svg aria-hidden="true" class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Back to cards
      </button>
      <p class="text-[15px] text-ink/70">
        {{ visibleCards.length }} {{ visibleCards.length === 1 ? 'card' : 'cards' }} on {{ printPages.length }} A4
        {{ printPages.length === 1 ? 'page' : 'pages' }}. Print at 100% scale and cut along the dashed lines.
      </p>
      <PrintButton :count="visibleCards.length" class="sm:ml-auto" label="Print" @click="$emit('print')"/>
    </div>

    <div class="flex w-full justify-center overflow-x-auto px-1 sm:px-3 print:overflow-visible print:p-0">
      <!-- The sheets are real A4 size; scale them down on smaller screens (not when printing). -->
      <div
          class="origin-top scale-45 transition-[scale] motion-reduce:transition-none min-[481px]:scale-60 min-[641px]:scale-70 min-[769px]:scale-80 min-[1025px]:scale-90 min-[1201px]:scale-100 print:m-0 print:scale-100 print:p-0"
      >
        <template v-for="(printPage, pageIndex) in printPages" :key="pageIndex">
          <p class="mb-2 text-[15px] text-ink/60 print:hidden">Page {{ pageIndex + 1 }} of {{ printPages.length }}</p>
          <div
              class="relative mx-auto mb-10 h-[297mm] w-[210mm] break-after-page overflow-hidden bg-white outline-1 outline-ink/25 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] last:mb-0 last:break-after-auto print:m-0 print:break-inside-avoid print:outline-0"
          >
            <div class="pointer-events-none absolute inset-0 z-[1000]">
              <div
                  v-for="column in 4"
                  :key="`x${column}`"
                  :style="{ left: `calc((210mm - 190.7mm) / 2 + ${column - 1} * 63.5mm)` }"
                  class="absolute top-0 h-[297mm] w-px crop-line-y opacity-70 print:opacity-100"
              ></div>
              <div
                  v-for="row in 4"
                  :key="`y${row}`"
                  :style="{ top: `calc((297mm - 267.3mm) / 2 + ${row - 1} * 89mm)` }"
                  class="absolute left-0 h-px w-[210mm] crop-line-x opacity-70 print:opacity-100"
              ></div>
            </div>

            <div
                class="grid h-full grid-cols-[repeat(3,2.5in)] grid-rows-[repeat(3,3.5in)]"
                style="padding: calc((297mm - 3 * 3.5in) / 2) calc((210mm - 3 * 2.5in) / 2)"
            >
              <div v-for="(card, cardIndex) in printPage" :key="cardIndex" class="relative">
                <Card :card="card" :edition="edition"/>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import Card from './Card.vue'
import type {CardData, EditionId} from '../types'
import PrintButton from './PrintButton.vue'
import {linkButtonClass} from '../util/ui'

const props = defineProps<{
  visibleCards: CardData[]
  edition: EditionId
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'print'): void
}>()

const printPages = computed(() => {
  const out: CardData[][] = []
  for (let i = 0; i < props.visibleCards.length; i += 9) {
    out.push(props.visibleCards.slice(i, i + 9))
  }
  return out
})
</script>
