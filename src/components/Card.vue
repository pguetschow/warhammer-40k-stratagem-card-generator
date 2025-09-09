<template>
  <div :style="{'--strip-color': stripColor, '--meta-color': metaColor}" class="card">
    <LeftStrip :cp="card.cp" :phases="card.phases" :stripColor="stripColor"/>
    <RightPane :card="card" :metaColor="metaColor" :stripColor="stripColor"/>
  </div>
</template>
<script lang="ts" setup>
import {computed} from 'vue'
import type {CardData} from '../types'
import {metaColorFor, stripColorFor} from '../util/helpers'
import LeftStrip from './LeftStrip.vue'
import RightPane from './RightPane.vue'

const props = defineProps<{ card: CardData }>()
const stripColor = computed(() => stripColorFor(props.card))
const metaColor = computed(() => metaColorFor(props.card))
</script>
