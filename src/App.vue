<template>
  <div class="container" style="max-width: 1100px; margin: 0 auto; padding: 24px;">
    <header class="controls">
      <div>
        <label>Faction</label>
        <select v-model="faction" @change="onFactionChange">
          <option v-for="(f, key) in dataByFaction" :key="key" :value="key">{{ f.name }}</option>
        </select>
      </div>
      <div>
        <label>Detachment</label>
        <select v-model="detachment">
          <option v-for="d in detachmentOptions" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div>
        <label><input v-model="includeCore" type="checkbox"/> Include Core stratagems</label>
      </div>
    </header>
    <section>
      <Page v-for="(page, i) in pages" :key="i" :cards="page" :index="i"/>
    </section>
  </div>
</template>
<script lang="ts" setup>
import {computed, ref} from 'vue'
import Page from './components/Page.vue'
import type {CardData, FactionData} from './types'

const dataByFaction = ref<Record<string, FactionData>>({})
const CORE = ref<CardData[]>([])
const loadError = ref(false)

async function loadData() {
  try {
    const res = await fetch('/data/cards.json', {cache: 'no-cache'})
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const json = await res.json()
    if (json.factions) {
      dataByFaction.value = json.factions
      CORE.value = json.factions.CORE?.detachments?.['(none)'] || []
    } else {
      throw new Error('Unknown JSON shape')
    }
  } catch (e) {
    console.warn('Fetch failed, maybe CORS. Use a local server.', e)
    loadError.value = true
  }
}

loadData()
const faction = ref('CORE')
const detachment = ref('(none)')
const includeCore = ref(true)
const cards = computed(() => {
  const all: CardData[] = []
  if (includeCore.value) all.push(...CORE.value)
  if (faction.value !== 'CORE') {
    const detMap = dataByFaction.value[faction.value]?.detachments || {}
    const d = detMap[detachment.value]
    if (d) all.push(...d)
  }
  if (faction.value === 'CORE' && detachment.value === '(none)' && !includeCore.value) return []
  return all
})
const pages = computed(() => {
  const out: CardData[][] = []
  for (let i = 0; i < cards.value.length; i += 9) out.push(cards.value.slice(i, i + 9))
  if (out.length === 0) out.push([])
  return out
})
const detachmentOptions = computed(() => Object.keys(dataByFaction.value[faction.value]?.detachments || {'(none)': CORE.value}))

function onFactionChange() {
  detachment.value = detachmentOptions.value[0]
}
</script>
