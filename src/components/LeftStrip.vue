<template>
  <div class="side">
    <div class="diamonds-container">
      <Diamond :color="stripColor"  isCp>
        {{ cp }}CP
      </Diamond>
      <Diamond v-for="(p,i) in phases" :key="i" :color="stripColor" >
        <component :is="iconComponent(p)"/>
      </Diamond>
    </div>
    <div :style="{ top: underlineY + 'px', backgroundColor: stripColor }" class="strip"></div>
  </div>
</template>
<script lang="ts" setup>
import Diamond from './Diamond.vue'
import CmdIcon from './icons/CmdIcon.vue'
import MoveIcon from './icons/MoveIcon.vue'
import ShootingIcon from './icons/ShootingIcon.vue'
import ChargeIcon from './icons/ChargeIcon.vue'
import FightIcon from './icons/FightIcon.vue'

const props = defineProps<{
  underlineY: number,
  cp: number,
  phases: Array<'cmd' | 'mov' | 'shoo' | 'chg' | 'fgt'>,
  stripColor: string
}>()

function iconComponent(p: string) {
  if (p === 'cmd') return CmdIcon;
  if (p === 'mov') return MoveIcon;
  if (p === 'shoo') return ShootingIcon;
  if (p === 'chg') return ChargeIcon;
  return FightIcon
}
</script>
