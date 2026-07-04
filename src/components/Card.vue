<template>
  <Card10 v-if="edition === '10'" :card="card"/>
  <Card11 v-else :card="card"/>
</template>

<script lang="ts" setup>
import type {CardData, EditionId} from '../types'
import Card10 from './Card10.vue'
import Card11 from './Card11.vue'

defineProps<{
  card: CardData
  edition: EditionId
}>()
</script>
