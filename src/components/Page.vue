<template>
  <div class="grid grid-cols-[repeat(auto-fill,2.5in)] justify-center gap-x-6 gap-y-7">
    <div
        v-for="(c,i) in cards"
        :key="i"
        :class="edition === '10' && 'rounded-[10px]'"
        class="relative shadow-xl shadow-black/40"
    >
      <Card :card="c" :edition="edition"/>
      <button
          :aria-label="`Remove ${c.name} from printing`"
          class="absolute -top-2.5 -right-2.5 z-10 grid size-7 place-items-center border border-iron-600 bg-iron-900 text-bone-300 shadow-lg shadow-black/50 transition hover:border-blood-400 hover:bg-blood-500 hover:text-bone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 print:hidden"
          title="Remove card from printing"
          type="button"
          @click="$emit('remove-card', c)"
      >
        <svg aria-hidden="true" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6 6 18" stroke-linecap="square"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Card from './Card.vue'
import type {CardData, EditionId} from '../types'

defineProps<{ cards: CardData[], index: number, edition: EditionId }>()
defineEmits<{ (e: 'remove-card', card: CardData): void }>()
</script>
