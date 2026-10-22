<template>
  <div class="print:m-0 print:p-0">
    <header
        class="mb-8 flex hud-frame flex-wrap items-center justify-between gap-5 p-4 shadow-2xl shadow-black/40 backdrop-blur sm:p-5 lg:sticky lg:top-3 lg:z-40 print:hidden"
    >
      <div class="max-w-xl">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="font-gothic text-2xl font-bold tracking-wider text-bone-100 uppercase">Print preview</h2>
          <span class="border border-iron-600 px-2 py-0.5 font-label text-xs font-semibold tracking-wider text-gold-400 uppercase">
            {{ visibleCards.length }} {{ visibleCards.length === 1 ? 'card' : 'cards' }} ·
            {{ printPages.length }} {{ printPages.length === 1 ? 'page' : 'pages' }}
          </span>
        </div>
        <p class="mt-1.5 text-sm/relaxed text-bone-300">
          Each A4 page holds 9 cards in a 3 × 3 grid with crop marks for cutting. Print at 100% scale so the
          cards fit your sleeves.
        </p>
      </div>
      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <button :class="secondaryButtonClass" type="button" @click="$emit('close')">
          <svg aria-hidden="true" class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke-linecap="square"/>
          </svg>
          Back to selection
        </button>
        <button :class="primaryButtonClass" type="button" @click="$emit('print')">
          <svg aria-hidden="true" class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6 9V3h12v6M6 18H4v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7h-2M6 14h12v7H6z" stroke-linecap="square"/>
          </svg>
          Print cards
        </button>
      </div>
    </header>

    <div class="flex w-full justify-center overflow-x-auto px-1 sm:px-3 print:overflow-visible print:p-0">
      <!-- The sheets are real A4 size; scale them down on smaller screens (not when printing). -->
      <div
          class="origin-top scale-45 transition-[scale] min-[481px]:scale-60 min-[641px]:scale-70 min-[769px]:scale-80 min-[1025px]:scale-90 min-[1201px]:scale-100 print:m-0 print:scale-100 print:p-0"
      >
        <div
            v-for="(printPage, pageIndex) in printPages"
            :key="pageIndex"
            class="relative mx-auto mb-10 h-[297mm] w-[210mm] break-after-page overflow-hidden bg-white shadow-2xl shadow-black/50 [-webkit-print-color-adjust:exact] [print-color-adjust:exact] last:mb-0 last:break-after-auto print:m-0 print:break-inside-avoid print:shadow-none"
        >
          <div class="absolute top-3 right-4 z-[1001] bg-iron-900 px-3 py-1 font-label text-xs font-semibold tracking-wider text-gold-300 uppercase print:hidden">
            Page {{ pageIndex + 1 }} of {{ printPages.length }}
          </div>

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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import Card from './Card.vue'
import type {CardData, EditionId} from '../types'
import {primaryButtonClass, secondaryButtonClass} from '../util/ui'

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
