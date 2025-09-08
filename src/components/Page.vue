<template>
  <div class="cards-grid">
    <div v-for="(c,i) in cards" :key="i" class="card-container">
      <Card :card="c"/>
      <button @click="$emit('remove-card', c)" class="remove-btn" title="Remove Card for Printing">×</button>
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
.cards-grid {
  display: grid;
  row-gap: 20px;
  column-gap: 20px;
  justify-content: center;
  padding: 0 20px;

  /* Desktop: 4 cards per row */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  max-width: 1200px;
  margin: 0 auto;
}

/* Large screens: up to 5 cards per row */
@media (min-width: 1400px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    max-width: 1400px;
  }
}

/* Medium screens: 3 cards per row */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    max-width: 900px;
    gap: 16px;
  }
}

/* Tablets: 2 cards per row */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    max-width: 640px;
    gap: 16px;
    padding: 0 16px;
  }
}

/* Mobile: 1 card per row */
@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    gap: 12px;
    padding: 0 12px;
  }
}

.card-container {
  position: relative;
  justify-self: center;
  max-width: 350px;
  width: 100%;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: 12px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-btn:hover {
  background: rgba(220, 53, 69);
  color: white;
  border-color: #dc3545;
}

@media print {
  .remove-btn {
    display: none !important;
  }
}
</style>