<template>
  <div class="sheet">
    <div class="grid">
      <div v-for="(c,i) in cards" :key="i" class="card-container">
        <Card :card="c"/>
        <button @click="$emit('remove-card', c)" class="remove-btn" title="Remove Card for Printing">×</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Card from './Card.vue'
import type {CardData} from '../types'

defineProps<{ cards: CardData[], index: number }>()
defineEmits<{ (e: 'remove-card', card: CardData): void }>()
</script>

<style scoped>
.card-container {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: rgba(255, 255, 255);
  color: #666;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(220, 53, 69);
  color: white;
  border-color: #dc3545;
}

.sheet {
  margin: 0 auto 32px auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  justify-content: center;
}

@media print {
  .remove-btn {
    display: none !important;
  }
}
</style>