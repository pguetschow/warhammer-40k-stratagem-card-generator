<template>
  <div class="sheet">
    <div class="grid">
      <Card v-for="(c,i) in cards" :key="i" :card="c"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Card from './Card.vue'
import type {CardData} from '../types'

defineProps<{ cards: CardData[], index: number }>()
</script>
