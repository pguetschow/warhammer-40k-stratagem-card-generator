<template>
  <div
      :style="{
      '--strip-color': stripColor,
      '--meta-color': metaColor,
      '--rail-offset-y': railSeed.offsetY + 'px',
      '--rail-flip-x': railSeed.flipX,
      '--rail-rotate': railSeed.rotate + 'deg',
    }"
      class="card"
  >
    <div v-if="!card.noCp" class="cp-tab">{{ card.cp }}CP</div>
    <div
        v-for="(band, i) in modeCpBands"
        :key="i"
        :style="bandStyle(band)"
        class="cp-modifier"
    >+{{ band.cpModifier }}CP
    </div>
    <LeftStrip :phases="card.phases" :stripColor="stripColor"/>
    <RightPane :card="card" :metaColor="metaColor" :stripColor="stripColor" @mode-cp-bands="modeCpBands = $event"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import type {CardData, CpBand} from '../types'
import {railSeedFor, stripColorFor, timingColorFor11} from '../util/helpers'
import LeftStrip from './LeftStrip.vue'
import RightPane from './RightPane.vue'

const props = defineProps<{ card: CardData }>()
const stripColor = computed(() => stripColorFor(props.card))
// The category bar / mode badges / +CP panel are colored by turn timing (see the core
// rulebook's Stratagems Key), not by faction.
const metaColor = computed(() => timingColorFor11(props.card))
const railSeed = computed(() => railSeedFor(props.card))
const modeCpBands = ref<CpBand[]>([])
watch(() => props.card, () => {
  modeCpBands.value = []
})

function bandStyle(band: CpBand) {
  return band.bottom !== null
      ? {top: band.top + 'px', height: (band.bottom - band.top) + 'px'}
      : {top: band.top + 'px', bottom: '0'}
}
</script>
