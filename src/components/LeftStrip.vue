<template>
  <div class="side">
    <div class="rail-icons">
      <div v-for="(p,i) in phases" :key="i" class="phase-icon-wrap">
        <component :is="iconComponent(p)"/>
      </div>
      <Diamond :shape="badgeShape" color="#f4f6ed">
        <SkullIcon/>
      </Diamond>
    </div>
    <div
        :class="{ 'rail-motif-b': railMotif === 'b' }"
        :style="{ backgroundColor: stripColor }"
        class="strip"
    ></div>
  </div>
</template>
<script lang="ts" setup>
import Diamond from './Diamond.vue'
import CmdIcon from './icons/CmdIcon.vue'
import MoveIcon from './icons/MoveIcon.vue'
import ShootingIcon from './icons/ShootingIcon.vue'
import ChargeIcon from './icons/ChargeIcon.vue'
import SwordsIcon from './icons/SwordsIcon.vue'
import CheckIcon from './icons/CheckIcon.vue'
import SkullIcon from './icons/SkullIcon.vue'

const props = defineProps<{
  phases: Array<'command' | 'movement' | 'shooting' | 'charge' | 'fight' | 'any'>,
  stripColor: string,
  railMotif?: 'a' | 'b',
  badgeShape?: 'up' | 'down' | 'diamond'
}>()

function iconComponent(p: string) {
  if (p === 'command') return CmdIcon;
  if (p === 'movement') return MoveIcon;
  if (p === 'shooting') return ShootingIcon;
  if (p === 'charge') return ChargeIcon;
  if (p === 'any') return CheckIcon;
  return SwordsIcon
}
</script>
