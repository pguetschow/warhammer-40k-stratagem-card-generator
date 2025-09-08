<template>
  <div class="print-preview">
    <header class="print-preview-header">
      <div class="preview-title">
        <h2>
          <span class="preview-icon">⎙</span>
          Print Preview
          <span class="card-count">{{ visibleCards.length }} Cards Ready</span>
        </h2>
        <p class="preview-description">
          Review your strategem cards before printing. Each page contains 9 cards in a 3×3 grid with crop marks for easy cutting.
        </p>
      </div>
      <div class="print-controls">
        <button @click="$emit('close')" class="control-btn secondary-btn">
          <span class="btn-icon">←</span>
          Back to Selection
        </button>
        <button @click="$emit('print')" class="control-btn primary-btn">
          <span class="btn-icon">⎙</span>
          Print Cards
        </button>
      </div>
    </header>

    <div class="print-pages-wrapper">
      <div class="print-pages">
        <div v-for="(printPage, pageIndex) in printPages" :key="pageIndex" class="print-page">
          <div class="page-number">Page {{ pageIndex + 1 }} of {{ printPages.length }}</div>

          <div class="grid-crop-marks">
            <div class="crop-line vertical" style="left: calc((210mm - 191mm) / 2 + 0 * 63.5mm)"></div>
            <div class="crop-line vertical" style="left: calc((210mm - 190.7mm) / 2 + 1 * 63.5mm)"></div>
            <div class="crop-line vertical" style="left: calc((210mm - 190.7mm) / 2 + 2 * 63.5mm)"></div>
            <div class="crop-line vertical" style="left: calc((210mm - 190.7mm) / 2 + 3 * 63.5mm)"></div>

            <div class="crop-line horizontal" style="top: calc((297mm - 267.3mm) / 2 + 0 * 89mm)"></div>
            <div class="crop-line horizontal" style="top: calc((297mm - 267.3mm) / 2 + 1 * 89mm)"></div>
            <div class="crop-line horizontal" style="top: calc((297mm - 267.3mm) / 2 + 2 * 89mm)"></div>
            <div class="crop-line horizontal" style="top: calc((297mm - 267.3mm) / 2 + 3 * 89mm)"></div>
          </div>

          <div class="print-grid">
            <div v-for="(card, cardIndex) in printPage" :key="cardIndex" class="print-card-wrapper">
              <Card :card="card" class="print-card"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Card from './Card.vue'
import type { CardData } from '../types'

const props = defineProps<{
  visibleCards: CardData[]
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

<style scoped>
.print-preview {
  margin-top: 32px;
}

.print-preview-header {
  background: var(--w40k-surface);
  border: 1px solid var(--w40k-border);
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.preview-title h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px 0;
  color: var(--w40k-gold);
  font-size: 1.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-icon {
  font-size: 1.6rem;
}

.card-count {
  font-size: 0.7rem;
  color: var(--w40k-text-muted);
  font-weight: normal;
  background: var(--w40k-bg);
  padding: 4px 12px;
  border: 1px solid var(--w40k-border);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.preview-description {
  color: var(--w40k-text-muted);
  margin: 0;
  line-height: 1.5;
  max-width: 500px;
}

.print-controls {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--w40k-border);
  background: var(--w40k-surface);
  color: var(--w40k-text);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  font-family: inherit;
}

.primary-btn {
  background: var(--w40k-accent);
  border-color: var(--w40k-accent);
  color: white;
}

.primary-btn:hover {
  background: var(--w40k-accent-hover);
  border-color: var(--w40k-accent-hover);
}

.secondary-btn:hover {
  background: var(--w40k-surface-light);
  border-color: var(--w40k-text-muted);
}

.btn-icon {
  font-size: 1.1rem;
}

.print-pages-wrapper {
  width: 100%;
  overflow-x: auto;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.print-pages {
  display: block;
  transform-origin: top center;
  transition: transform 0.2s ease;
}

@media (max-width: 1200px) {
  .print-pages {
    transform: scale(0.9);
  }

  .print-pages-wrapper {
    padding: 0 10px;
  }
}

@media (max-width: 1024px) {
  .print-pages {
    transform: scale(0.8);
  }

  .print-preview-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .preview-title h2 {
    justify-content: center;
    flex-wrap: wrap;
  }

  .print-controls {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .print-pages {
    transform: scale(0.7);
  }

  .print-pages-wrapper {
    padding: 0 5px;
  }
}

@media (max-width: 640px) {
  .print-pages {
    transform: scale(0.6);
  }

  .print-controls {
    flex-direction: column;
  }

  .control-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .print-pages {
    transform: scale(0.45);
  }
}

.print-page {
  page-break-after: always;
  width: 210mm;
  height: 297mm;
  margin: 0 auto 40px;
  border: 1px solid var(--w40k-border);
  position: relative;
  background: white;
  box-sizing: border-box;
  overflow: hidden;
}

.print-page:last-child {
  page-break-after: auto;
  margin-bottom: 0;
}

.page-number {
  position: absolute;
  top: 10px;
  right: 15px;
  background: var(--w40k-accent);
  color: white;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1001;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.print-grid {
  display: grid;
  grid-template-columns: repeat(3, 2.5in);
  grid-template-rows: repeat(3, 3.5in);
  gap: 0;
  padding: calc((297mm - 3 * 3.5in) / 2) calc((210mm - 3 * 2.5in) / 2);
  height: 100%;
  box-sizing: border-box;
}

.print-card-wrapper {
  position: relative;
}

.print-card {
  width: 2.5in;
  height: 3.5in;
}

.grid-crop-marks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

.crop-line {
  position: absolute;
  background: transparent;
  opacity: 0.7;
}

.crop-line.vertical {
  width: 1px;
  height: 297mm;
  top: 0;
  background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      #666 3px,
      #666 5px
  );
}

.crop-line.horizontal {
  height: 1px;
  width: 210mm;
  left: 0;
  background: repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 3px,
      #666 3px,
      #666 5px
  );
}

@media print {
  .print-preview-header {
    display: none !important;
  }

  .page-number {
    display: none !important;
  }

  .print-pages-wrapper {
    padding: 0 !important;
    overflow: visible !important;
  }

  .print-pages {
    transform: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-preview {
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-page {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    page-break-inside: avoid !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .print-grid {
    overflow: hidden !important;
    position: relative !important;
  }

  .grid-crop-marks {
    overflow: hidden !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
  }

  .print-card {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .crop-line {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
    position: absolute !important;
    opacity: 1 !important;
  }

  .crop-line.vertical {
    width: 1px !important;
    height: 297mm !important;
    top: 0 !important;
    overflow: hidden !important;
    background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        #000 3px,
        #000 5px
    ) !important;
  }

  .crop-line.horizontal {
    height: 1px !important;
    width: 210mm !important;
    left: 0 !important;
    overflow: hidden !important;
    background: repeating-linear-gradient(
        to right,
        transparent 0px,
        transparent 3px,
        #000 3px,
        #000 5px
    ) !important;
  }

  @page {
    margin: 0 !important;
    size: A4 portrait !important;
  }
}
</style>