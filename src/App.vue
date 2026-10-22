<template>
  <div class="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 print:max-w-none print:p-0">
    <header class="print:hidden">
      <div class="flex min-h-16 clip-corner items-center justify-between gap-4 bg-band py-3 pr-10 pl-5 [--clip:22px] sm:pl-7">
        <h1 class="font-heavy text-[clamp(1.35rem,4vw,2rem)] leading-none text-slip uppercase">
          Stratagem card printer
        </h1>
        <nav aria-label="Project links" class="flex shrink-0 gap-1">
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

      <div aria-label="Edition" class="flex bg-teal" role="radiogroup">
        <button
            v-for="editionOption in editions"
            :key="editionOption.id"
            :aria-checked="selectedEdition === editionOption.id"
            :class="selectedEdition === editionOption.id ? 'bg-paper text-ink' : 'text-slip/85 hover:bg-teal-dark hover:text-slip'"
            class="px-5 py-2.5 font-heavy text-[13px] tracking-[0.05em] uppercase focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-slip"
            role="radio"
            type="button"
            @click="selectEdition(editionOption.id)"
        >
          {{ editionOption.label }}
        </button>
      </div>

      <div class="mt-6 max-w-[44rem]">
        <p>
          Print your army's stratagems as cards that fit standard 2.5 × 3.5 inch sleeves. Choose a faction and
          detachment, take out the cards you won't use, then print.
        </p>
        <p class="mt-1 text-[15px] text-ink/65">
          Rules text from the
          <a :href="sourceUrl" class="font-semibold text-teal underline decoration-teal/40 underline-offset-2 hover:decoration-teal">Wahapedia data export</a><template v-if="lastUpdateLabel">, last updated {{ lastUpdateLabel }}</template>.
        </p>
      </div>
    </header>

    <section
        v-if="!showPrintPreview"
        aria-label="Card selection"
        class="mt-6 border-b-2 border-ink bg-paper py-4 lg:sticky lg:top-0 lg:z-40 print:hidden"
    >
      <div class="flex flex-wrap items-end gap-x-5 gap-y-4">
        <label class="w-full sm:w-72">
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
            <svg aria-hidden="true" :class="chevronClass" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </label>

        <label class="w-full sm:w-72">
          <span :class="labelClass">Detachment</span>
          <span class="relative block">
            <select v-model="detachment" :class="selectClass" @change="onDetachmentChange">
              <optgroup v-for="group in detachmentGroups" :key="group.label" :label="group.label">
                <option v-for="d in group.options" :key="d.value" :value="d.value">{{ d.label }}</option>
              </optgroup>
            </select>
            <svg aria-hidden="true" :class="chevronClass" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </label>

        <label
            :class="isCore ? 'cursor-not-allowed text-ink/45' : 'cursor-pointer'"
            class="flex h-11 items-center gap-2.5 font-semibold"
        >
          <input v-model="includeCore" :disabled="isCore" class="size-5 accent-teal" type="checkbox"/>
          Include core stratagems
        </label>

        <div class="flex w-full flex-wrap items-center gap-x-5 gap-y-3 sm:ml-auto sm:w-auto">
          <button v-if="removedCount" :class="linkButtonClass" type="button" @click="resetRemovedCards">
            Restore {{ removedCount }} removed {{ removedCount === 1 ? 'card' : 'cards' }}
          </button>
          <button
              :class="primaryButtonClass"
              :disabled="visibleCards.length === 0"
              type="button"
              @click="openPrintDialog"
          >
            Print preview
          </button>
        </div>
      </div>
    </section>

    <p
        v-if="loadError"
        class="mt-6 border-l-4 border-blood bg-slip px-4 py-3 print:hidden"
        role="alert"
    >
      Couldn't load the card data. Check your connection, then reload the page.
    </p>

    <section v-if="!showPrintPreview" aria-label="Cards" class="print:hidden">
      <div v-if="visibleCards.length === 0" class="mt-6 border-2 border-dashed border-ink/35 px-6 py-10">
        <p class="text-[21px] font-bold">No stratagems to show</p>
        <p class="mt-1 text-ink/70">Choose a faction and detachment above to see its cards.</p>
      </div>
      <template v-else>
        <p class="mt-5 mb-5 text-[15px] text-ink/70">
          {{ visibleCards.length }} {{ visibleCards.length === 1 ? 'card' : 'cards' }}. Use × on a card to leave it
          out of the print.
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
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import Page from './components/Page.vue'
import PrintPreview from './components/PrintPreview.vue'
import {linkButtonClass, primaryButtonClass} from './util/ui'
import type {CardData, EditionData, EditionOption, FactionData} from './types'

const ALL_DETACHMENTS_ONLY_KEY = '(all-detachments)'
const ALL_DETACHMENTS_CP_KEY = '(all-detachments-and-combat-patrols)'
const ALL_DETACHMENTS_ONLY_LABEL = 'All Detachments'
const ALL_DETACHMENTS_CP_LABEL = 'All Detachments (incl. Combat Patrols)'
// The Core faction's '(none)' detachment holds the Core Stratagems; its other detachments group
// core abilities and game-mode stratagems (Boarding Actions, Challenger, ...).
const CORE_STRATAGEMS_LABEL = 'Core Stratagems'

const labelClass = 'mb-1 block text-[15px] font-semibold'
const selectClass = 'h-11 w-full appearance-none border-2 border-ink bg-slip pr-10 pl-3 font-semibold text-ink ' +
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal'
const chevronClass = 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink'
const iconLinkClass = 'grid size-10 place-items-center text-slip/70 hover:text-slip focus-visible:outline-3 ' +
    'focus-visible:outline-offset-[-3px] focus-visible:outline-teal'

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

// Wahapedia stamps exports as "2026-10-21 16:06:23"; show the date the way people write it.
const lastUpdateLabel = computed(() => {
  const date = new Date(lastUpdate.value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return lastUpdate.value
  return date.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})
})


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
