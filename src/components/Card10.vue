<template>
  <div :style="{'--strip-color': stripColor, '--meta-color': metaColor}" class="card10">
    <div class="side10">
      <div class="diamonds10">
        <div class="diamond10 cp10">
          <div class="icon-wrap10">{{ card.cp }}CP</div>
        </div>
        <div v-for="(phase, index) in card.phases" :key="index" class="diamond10">
          <div class="icon-wrap10">
            <component :is="iconComponent(phase)"/>
          </div>
        </div>
      </div>
      <div class="strip10"></div>
    </div>

    <div class="right-pane10">
      <div class="title10">{{ card.name.toUpperCase() }}</div>
      <div class="underline10"></div>
      <div class="meta-bg10"></div>
      <div class="meta-text10">
        <strong>{{ card.type }}</strong>
      </div>
      <div class="body10">
        <div class="sec10">
          <h6>WHEN:</h6>
          <p v-html="card.when"></p>
        </div>
        <div class="sec10">
          <h6>TARGET:</h6>
          <p v-html="card.target"></p>
        </div>
        <div class="sec10">
          <h6>EFFECT:</h6>
          <p v-html="card.effect"></p>
        </div>
        <div v-if="card.restrictions" class="sec10">
          <h6>RESTRICTIONS:</h6>
          <p v-html="card.restrictions"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import type {CardData, PhaseKey} from '../types'
import {metaColorFor, stripColorFor} from '../util/helpers'
import CmdIcon from './icons/CmdIcon.vue'
import MoveIcon from './icons/MoveIcon.vue'
import ShootingIcon from './icons/ShootingIcon.vue'
import ChargeIcon from './icons/ChargeIcon.vue'
import FightIcon from './icons/FightIcon.vue'

const props = defineProps<{ card: CardData }>()
const stripColor = computed(() => stripColorFor(props.card))
const metaColor = computed(() => metaColorFor(props.card))

function iconComponent(phase: PhaseKey) {
  if (phase === 'command') return CmdIcon
  if (phase === 'movement') return MoveIcon
  if (phase === 'shooting') return ShootingIcon
  if (phase === 'charge') return ChargeIcon
  return FightIcon
}
</script>

<style scoped>
.card10 {
  position: relative;
  width: 2.5in;
  height: 3.5in;
  background: var(--bg);
  border: 3px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.title10 {
  margin-left: 38px;
  margin-top: 2px;
  padding: 8px 6px;
  color: var(--strip-color);
  font-weight: 800;
  line-height: 1.05;
  font-size: 12px;
  text-transform: uppercase;
  height: 39px;
  display: flex;
  align-items: center;
}

.underline10 {
  margin-left: 24px;
  width: calc(100% - 24px);
  height: 0;
  border-top: 2px solid var(--strip-color);
}

.meta-bg10 {
  position: absolute;
  left: 29px;
  right: 0;
  height: 30px;
  background: var(--meta-color);
  z-index: 1;
}

.meta-text10 {
  margin-left: 38px;
  padding: 4px 6px;
  font-size: 8.5px;
  line-height: 1.1;
  font-style: italic;
  color: var(--meta-fg);
  height: 30px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  position: relative;
  z-index: 2;
  align-content: center;
}

.meta-text10 strong {
  font-style: normal;
  font-weight: 600;
}

.body10 {
  margin-left: 38px;
  padding: 4px 8px 4px 5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sec10 h6 {
  margin: 0;
  color: var(--strip-color);
  font-weight: 800;
  font-size: 9px;
  letter-spacing: .02em;
}

.sec10 p {
  margin: 0;
  font-size: 8.35px;
  line-height: 1.05;
}

.side10 {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.diamonds10 {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 17px;
  left: 8px;
  top: 29px;
}

.diamond10 {
  flex: 0 0 25px;
  width: 25px;
  height: 25px;
  min-width: 25px;
  min-height: 25px;
  max-width: 25px;
  max-height: 25px;
  aspect-ratio: 1 / 1;
  transform: rotate(45deg);
  border: 1px solid var(--strip-color);
  background: #fff;
  box-shadow: 0 0 0 1px #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.diamond10 svg {
  transform: scale(1.5);
  fill: var(--strip-color);
}

.icon-wrap10 {
  transform: rotate(-45deg);
  display: grid;
  place-items: center;
  color: var(--strip-color);
}

.cp10 .icon-wrap10 {
  font-weight: 800;
  font-size: 12px;
}

.strip10 {
  position: absolute;
  left: 8px;
  top: 40px;
  width: 25px;
  bottom: 0;
  background: var(--strip-color);
  z-index: -2;
}
</style>
