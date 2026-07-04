<template>
  <div :style="{'--strip-color': stripColor, '--meta-color': metaColor}" class="card">
    <div v-if="!card.noCp" class="cp-tab">{{ card.cp }}CP</div>
    <div
        v-if="modeCpModifier"
        :style="{ top: modeCpY !== null ? modeCpY + 'px' : undefined }"
        class="cp-modifier"
    >+{{ modeCpModifier }}CP
    </div>
    <LeftStrip :phases="card.phases" :stripColor="stripColor"/>
    <RightPane :card="card" :metaColor="metaColor" :stripColor="stripColor" @mode-cp-y="modeCpY = $event"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import type {CardData} from '../types'
import {stripColorFor, timingColorFor11} from '../util/helpers'
import LeftStrip from './LeftStrip.vue'
import RightPane from './RightPane.vue'

const props = defineProps<{ card: CardData }>()
const stripColor = computed(() => stripColorFor(props.card))
// The category bar / mode badges / +CP panel are colored by turn timing (see the core
// rulebook's Stratagems Key), not by faction.
const metaColor = computed(() => timingColorFor11(props.card))
const modeCpModifier = computed(() => {
  return props.card.modes?.reduce((max, mode) => Math.max(max, mode.cpModifier || 0), 0) || 0
})
const modeCpY = ref<number | null>(null)
watch(() => props.card, () => {
  modeCpY.value = null
})
</script>
