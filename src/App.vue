<template>
  <div
      class="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(212,168,58,0.13),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(163,21,28,0.10),transparent_60%)] bg-fixed print:bg-none"
  >
    <div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 print:max-w-none print:p-0">
      <header class="pt-8 pb-6 sm:pt-12 sm:pb-8 print:hidden">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div class="flex max-w-3xl items-start gap-5">
            <div
                aria-hidden="true"
                class="mt-1 hidden size-14 shrink-0 rotate-45 place-items-center border-2 border-gold-400/80 bg-iron-900 shadow-[0_0_24px_rgba(212,168,58,0.25)] sm:grid"
            >
              <span class="block h-8 w-6 -rotate-45 text-gold-300">
                <SkullIcon class="size-full"/>
              </span>
            </div>
            <div>
              <p class="font-label text-xs font-semibold tracking-[0.35em] text-gold-400 uppercase">Warhammer 40,000</p>
              <h1 class="mt-1.5 font-gothic text-3xl font-black tracking-wider text-bone-100 uppercase [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-[2.6rem]">
                Stratagem Card Printer
              </h1>
              <p class="mt-3 max-w-2xl text-sm/relaxed text-bone-300">
                Generate and print stratagem cards for your battles: pick your faction and detachment and leave out
                the stratagems you don't need. Sized for 2.5″ × 3.5″ sleeves (like Magic: The Gathering).
              </p>
              <p class="mt-2 text-xs text-bone-500">
                Based on the stratagems available at
                <a :href="sourceUrl" class="text-gold-400 underline-offset-2 hover:text-gold-200 hover:underline">Wahapedia</a>.
                <span v-if="lastUpdate">Last export update: {{ lastUpdate }}</span>
              </p>
            </div>
          </div>

          <nav aria-label="Project links" class="flex items-center gap-2">
            <a
                :class="iconLinkClass"
                aria-label="View source on GitHub"
                href="https://github.com/pguetschow/warhammer-40k-stratagem-card-generator/"
                rel="noopener noreferrer"
                target="_blank"
                title="View source on GitHub"
            >
              <svg aria-hidden="true" class="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.87 3.16 9 7.55 10.45.55.1.76-.24.76-.54 0-.27-.01-1.16-.02-2.1-3.07.67-3.72-1.32-3.72-1.32-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.66.08-.66 1.1.08 1.67 1.13 1.67 1.13.98 1.67 2.58 1.18 3.21.9.1-.71.38-1.18.69-1.45-2.45-.28-5.02-1.23-5.02-5.47 0-1.21.43-2.19 1.14-2.96-.12-.28-.5-1.42.1-2.96 0 0 .95-.3 3.12 1.13a10.8 10.8 0 0 1 5.68 0c2.17-1.43 3.12-1.13 3.12-1.13.6 1.54.22 2.68.1 2.96.71.77 1.14 1.75 1.14 2.96 0 4.25-2.58 5.18-5.04 5.46.39.34.74 1.01.74 2.03 0 1.47-.01 2.65-.01 3.01 0 .3.2.65.77.54 4.38-1.46 7.54-5.58 7.54-10.45C23.1 5.33 18.27.5 12 .5Z"/>
              </svg>
            </a>
            <a
                :class="iconLinkClass"
                aria-label="Contact us by email"
                href="mailto:stratagemprint@gmail.com"
                title="Contact us at stratagemprint@gmail.com"
            >
              <svg aria-hidden="true" class="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.6V17h16V7.6l-7.4 5.3a1 1 0 0 1-1.2 0L4 7.6ZM19.2 7H4.8L12 12.1 19.2 7Z"/>
              </svg>
            </a>
          </nav>
        </div>

        <div aria-hidden="true" class="mt-8 flex items-center gap-3">
          <span class="h-px flex-1 bg-linear-to-r from-transparent to-gold-500/50"></span>
          <span class="size-1.5 rotate-45 bg-gold-400"></span>
          <span class="h-px flex-1 bg-linear-to-l from-transparent to-gold-500/50"></span>
        </div>
      </header>

      <section
          v-if="!showPrintPreview"
          class="mb-8 hud-frame p-4 shadow-2xl shadow-black/40 backdrop-blur sm:p-5 lg:sticky lg:top-3 lg:z-40 print:hidden"
      >
        <div class="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <div>
            <span id="edition-label" :class="labelClass">Edition</span>
            <div aria-labelledby="edition-label" class="flex border border-iron-700 bg-iron-950 p-1" role="radiogroup">
              <button
                  v-for="editionOption in editions"
                  :key="editionOption.id"
                  :aria-checked="selectedEdition === editionOption.id"
                  :class="selectedEdition === editionOption.id
                    ? 'bg-linear-to-b from-gold-300 to-gold-500 text-iron-950'
                    : 'text-bone-500 hover:bg-iron-800 hover:text-bone-100'"
                  class="flex-1 px-3 py-1.5 font-label text-sm font-bold tracking-wider whitespace-nowrap uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                  role="radio"
                  type="button"
                  @click="selectEdition(editionOption.id)"
              >
                {{ editionOption.label }}
              </button>
            </div>
          </div>

          <label class="block">
            <span :class="labelClass">Faction</span>
            <span class="relative block">
              <select v-model="faction" :class="selectClass" @change="onFactionChange">
                <template v-if="groupedDropdown.length">
                  <optgroup v-for="grp in groupedDropdown" :key="grp.group" :label="grp.group">
                    <option v-for="f in grp.items" :key="f.key" :value="f.key">{{ f.label }}</option>
                  </optgroup>
                </template>
                <template v-else>
                  <option v-for="(f, key) in dataByFaction" :key="key" :value="key">{{ f.name }}</option>
                </template>
              </select>
              <svg aria-hidden="true" :class="chevronClass" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" stroke-linecap="square"/>
              </svg>
            </span>
          </label>

          <label class="block">
            <span :class="labelClass">Detachment</span>
            <span class="relative block">
              <select v-model="detachment" :class="selectClass" @change="onDetachmentChange">
                <optgroup v-for="group in detachmentGroups" :key="group.label" :label="group.label">
                  <option v-for="d in group.options" :key="d.value" :value="d.value">{{ d.label }}</option>
                </optgroup>
              </select>
              <svg aria-hidden="true" :class="chevronClass" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" stroke-linecap="square"/>
              </svg>
            </span>
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-iron-700 pt-4">
          <label
              :class="isCore ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
              class="inline-flex items-center gap-3 font-label text-sm font-semibold tracking-wider text-bone-100 uppercase"
          >
            <input v-model="includeCore" :disabled="isCore" class="peer sr-only" type="checkbox"/>
            <span
                aria-hidden="true"
                class="relative h-5 w-9 shrink-0 border border-iron-600 bg-iron-950 transition peer-checked:border-gold-500 peer-checked:bg-gold-500/25 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-400 after:absolute after:top-0.5 after:left-0.5 after:size-3.5 after:bg-bone-500 after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-gold-300"
            ></span>
            Include Core Stratagems
          </label>

          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
                :class="secondaryButtonClass"
                :disabled="removedCount === 0"
                type="button"
                @click="resetRemovedCards"
            >
              <svg aria-hidden="true" class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" stroke-linecap="square"/>
              </svg>
              Reset removed
              <span v-if="removedCount" class="bg-blood-500 px-1.5 text-xs text-bone-100">{{ removedCount }}</span>
            </button>
            <button
                :class="primaryButtonClass"
                :disabled="visibleCards.length === 0"
                type="button"
                @click="openPrintDialog"
            >
              <svg aria-hidden="true" class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 9V3h12v6M6 18H4v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7h-2M6 14h12v7H6z" stroke-linecap="square"/>
              </svg>
              Print preview
              <span class="bg-iron-950/20 px-1.5 text-xs">{{ visibleCards.length }}</span>
            </button>
          </div>
        </div>
      </section>

      <p
          v-if="loadError"
          class="mb-6 border border-blood-500/60 bg-blood-900/50 px-4 py-3 text-sm text-bone-100 print:hidden"
          role="alert"
      >
        The card data couldn't be loaded. Please reload the page to try again.
      </p>

      <section v-if="!showPrintPreview" class="print:hidden">
        <div v-if="visibleCards.length === 0" class="hud-frame px-6 py-16 text-center">
          <h3 class="font-gothic text-xl font-bold tracking-wider text-bone-100 uppercase">No cards available</h3>
          <p class="mt-2 text-sm text-bone-500">Select a faction and detachment to view available stratagem cards.</p>
        </div>
        <template v-else>
          <p class="mb-5 font-label text-sm tracking-wider text-bone-500 uppercase">
            <span class="font-bold text-gold-400">{{ visibleCards.length }}</span>
            {{ visibleCards.length === 1 ? 'card' : 'cards' }} · remove the ones you don't need with ×
          </p>
          <Page :cards="visibleCards" :edition="selectedEdition" :index="0" @remove-card="removeCard"/>
        </template>
      </section>

      <PrintPreview
          v-if="showPrintPreview"
          :edition="selectedEdition"
          :visible-cards="visibleCards"
          @close="closePrintPreview"
          @print="printCards"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import Page from './components/Page.vue'
import PrintPreview from './components/PrintPreview.vue'
import SkullIcon from './components/icons/SkullIcon.vue'
import {primaryButtonClass, secondaryButtonClass} from './util/ui'
import type {CardData, EditionData, EditionOption, FactionData} from './types'

const ALL_DETACHMENTS_ONLY_KEY = '(all-detachments)'
const ALL_DETACHMENTS_CP_KEY = '(all-detachments-and-combat-patrols)'
const ALL_DETACHMENTS_ONLY_LABEL = 'All Detachments'
const ALL_DETACHMENTS_CP_LABEL = 'All Detachments (incl. Combat Patrols)'
// The Core faction's '(none)' detachment holds the Core Stratagems; its other detachments group
// core abilities and game-mode stratagems (Boarding Actions, Challenger, ...).
const CORE_STRATAGEMS_LABEL = 'Core Stratagems'

const labelClass = 'mb-1.5 block font-label text-xs font-semibold tracking-[0.18em] text-gold-400 uppercase'
const selectClass = 'w-full appearance-none border border-iron-700 bg-iron-950 py-2.5 pr-10 pl-3 text-sm ' +
    'text-bone-100 transition outline-none hover:border-iron-600 focus:border-gold-400 ' +
    'focus:ring-2 focus:ring-gold-400/25'
const chevronClass = 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gold-500'
const iconLinkClass = 'grid size-10 place-items-center border border-iron-700 bg-iron-900 text-bone-500 ' +
    'transition hover:border-gold-500/60 hover:text-gold-300 focus-visible:outline-2 ' +
    'focus-visible:outline-offset-2 focus-visible:outline-gold-400'
type FactionGroups = Record<string, string[]>

const dataByFaction = ref<Record<string, FactionData>>({})
const factionGroups = ref<FactionGroups>({})
const Core = ref<CardData[]>([])
const editions = ref<EditionOption[]>([])
const selectedEdition = ref('11')
const sourceUrl = ref('https://wahapedia.ru/wh40k11ed/the-rules/data-export/')
const lastUpdate = ref('')
const loadError = ref(false)
const removedCardIds = ref<Set<string>>(new Set())
const showPrintPreview = ref(false)

async function loadEditions() {
  try {
    const response = await fetch('/data/editions.json', {cache: 'no-cache'})
    if (!response.ok) throw new Error('Failed to load editions.json')
    const manifest = await response.json()
    editions.value = manifest.editions || []
    if (!editions.value.some((edition) => edition.id === selectedEdition.value)) {
      selectedEdition.value = editions.value[0]?.id || '11'
    }
  } catch (e) {
    console.warn('Failed to load editions.json', e)
    editions.value = [
      {id: '10', label: '10th Edition', sourceUrl: 'https://wahapedia.ru/wh40k10ed/the-rules/data-export/'},
      {id: '11', label: '11th Edition', sourceUrl: 'https://wahapedia.ru/wh40k11ed/the-rules/data-export/'},
    ]
  }
}

async function loadData() {
  try {
    const response = await fetch(`/data/${selectedEdition.value}/cards.json`, {cache: 'no-cache'})
    if (!response.ok) throw new Error(`Failed to load ${selectedEdition.value}/cards.json`)
    const editionData = await response.json() as EditionData

    dataByFaction.value = editionData.factions
    factionGroups.value = editionData.factionGroups
    Core.value = editionData.factions.Core?.detachments['(none)'] || []
    sourceUrl.value = editionData.sourceUrl
    lastUpdate.value = editionData.lastUpdate

    if (!dataByFaction.value[faction.value]) {
      faction.value = dataByFaction.value.Core ? 'Core' : Object.keys(dataByFaction.value)[0] || ''
    }
    detachment.value = firstDetachmentOption.value || '(none)'
    resetRemovedCards()
    loadError.value = false
  } catch (e) {
    console.warn('Failed to load edition data', e)
    loadError.value = true
  }
}

loadEditions().then(loadData)

const faction = ref('Core')
const detachment = ref('(none)')
const includeCore = ref(true)

const isCore = computed(() => faction.value === 'Core')

const allCards = computed(() => {
  const all: CardData[] = []
  const f = dataByFaction.value[faction.value] || {}
  const detMap = (f as any).detachments || {}
  const cpMap = (f as any).combatPatrols || {}

  if (detachment.value === ALL_DETACHMENTS_ONLY_KEY) {
    for (const arr of Object.values(detMap)) {
      if (Array.isArray(arr)) all.push(...(arr as CardData[]))
    }
  } else if (detachment.value === ALL_DETACHMENTS_CP_KEY) {
    for (const arr of Object.values(detMap)) {
      if (Array.isArray(arr)) all.push(...(arr as CardData[]))
    }
    for (const arr of Object.values(cpMap)) {
      if (Array.isArray(arr)) all.push(...(arr as CardData[]))
    }
  } else {
    let d: CardData[] | undefined = detMap[detachment.value]
    if (!d) {
      const cp = cpMap[detachment.value]
      if (Array.isArray(cp)) d = cp as CardData[]
    }
    if (d) all.push(...d)
  }
  if (includeCore.value && !isCore.value) all.push(...Core.value)
  return all
})

const visibleCards = computed(() => {
  return allCards.value.filter(card => !removedCardIds.value.has(getCardId(card)))
})

const removedCount = computed(() => allCards.value.length - visibleCards.value.length)


const detachmentGroups = computed(() => {
  const f = dataByFaction.value[faction.value] || {}
  const army = Object.keys(f?.detachments || {})
  const patrols = Object.keys((f as any)?.combatPatrols || {})

  const groups: Array<{ label: string; options: Array<{ value: string; label: string }> }> = []

  // Quick Select (only if there is at least one option to aggregate)
  const quick: Array<{ value: string; label: string }> = []
  if (army.length) {
    quick.push({value: ALL_DETACHMENTS_ONLY_KEY, label: ALL_DETACHMENTS_ONLY_LABEL})
  }
  if (army.length && patrols.length) {
    quick.push({value: ALL_DETACHMENTS_CP_KEY, label: ALL_DETACHMENTS_CP_LABEL})
  }
  if (quick.length && faction.value !== 'Core') {
    groups.push({label: 'Quick Select', options: quick})
  }

  if (army.length && faction.value === 'Core') {
    groups.push({
      label: 'Core Rules',
      options: army.map(n => ({value: n, label: n === '(none)' ? CORE_STRATAGEMS_LABEL : n})),
    })
  } else if (army.length) {
    groups.push({label: 'Army Detachments', options: army.map(n => ({value: n, label: n}))})
  }
  if (patrols.length) groups.push({label: 'Combat Patrol', options: patrols.map(n => ({value: n, label: n}))})

  if (!groups.length) {
    // Fallback for Core or empty: keep a placeholder '(none)' mapped to Core
    groups.push({label: 'Army', options: [{value: '(none)', label: '(none)'}]})
  }

  return groups
})

const firstDetachmentOption = computed(() => {
  const groups = detachmentGroups.value
  for (const g of groups) {
    if (g.options.length) return g.options[0].value
  }
  return '(none)'
})

const groupedDropdown = computed(() => {
  const groups = factionGroups.value || {}
  const available = new Set(Object.keys(dataByFaction.value || {}))

  const result: Array<{ group: string; items: Array<{ key: string; label: string }> }> = []

  const preferredOrder = ['Forces of the Imperium', 'Forces of Chaos', 'Xenos', 'Other']
  for (const groupName of preferredOrder) {
    const list = groups[groupName] || []
    const items = list
        .filter(f => available.has(f))
        .map(f => ({key: f, label: dataByFaction.value[f]?.name || f}))
    if (items.length) {
      result.push({group: groupName, items})
    }
  }

  const alreadyListed = new Set(result.flatMap(g => g.items.map(i => i.key)))
  const other = [...available].filter(k => !alreadyListed.has(k))
  if (other.length) {
    const items = other.map(f => ({key: f, label: dataByFaction.value[f]?.name || f}))
    result.push({group: 'Other', items})
  }

  return result
})

function getCardId(card: CardData): string {
  return `${card.name}_${card.group}_${card.type}`
}

function removeCard(card: CardData) {
  removedCardIds.value.add(getCardId(card))
}

function resetRemovedCards() {
  removedCardIds.value.clear()
}

function selectEdition(id: string) {
  if (id === selectedEdition.value) return
  selectedEdition.value = id
  loadData()
}

function onFactionChange() {
  detachment.value = firstDetachmentOption.value || '(none)'
  resetRemovedCards()
}

function onDetachmentChange() {
  resetRemovedCards()
}

function openPrintDialog() {
  showPrintPreview.value = true
}

function closePrintPreview() {
  showPrintPreview.value = false
}

function printCards() {
  window.print()
}
</script>
