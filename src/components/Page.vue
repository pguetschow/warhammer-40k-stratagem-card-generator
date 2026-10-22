<template>
  <div class="grid grid-cols-[repeat(auto-fill,2.5in)] justify-center gap-x-6 gap-y-8 sm:justify-start">
    <div
        v-for="(c,i) in cards"
        :key="i"
        :class="edition === '10' && 'rounded-[10px]'"
        class="relative shadow-[0_1px_0_rgb(0_0_0/0.2),0_10px_18px_-10px_rgb(22_21_15/0.55)]"
    >
      <Card :card="c" :edition="edition"/>
      <button
          :aria-label="`Remove ${c.name} from printing`"
          class="absolute -top-3 -right-3 z-10 grid size-7 place-items-center bg-band text-slip hover:bg-blood focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal print:hidden"
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
