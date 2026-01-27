<template>
  <div :class="{ 'print-preview-active': showPrintPreview }" class="app-container">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 32px;">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            WARHAMMER 40k STRATEGEM CARD PRINTER
          </h1>
          <p class="app-description">
            Generate and print strategem cards for your Warhammer 40,000 battles.
            Select your faction, detachment, and choose the stratagems for your army.
            <br>
            Suitable for 2.5"x 3.5" sleeves (like Magic: The Gathering)
          </p>
          <p class="app-description">
            Based on the Stratagems available at <a href="https://wahapedia.ru/wh40k10ed">Wahapedia</a> and from the
            official Combat Patrol PDFs.
          </p>
        </div>
      </header>

      <section class="controls-section">
        <div class="controls-grid">
          <div class="control-group">
            <label class="control-label">Faction</label>
            <select
                v-if="groupedDropdown.length"
                v-model="faction"
                class="control-select"
                @change="onFactionChange"
            >
              <optgroup
                  v-for="grp in groupedDropdown"
                  :key="grp.group"
                  :label="grp.group"
              >
                <option
                    v-for="f in grp.items"
                    :key="f.key"
                    :value="f.key"
                >
                  {{ f.label }}
                </option>
              </optgroup>
            </select>

            <!-- Fallback-->
            <select
                v-else
                v-model="faction"
                class="control-select"
                @change="onFactionChange"
            >
              <option
                  v-for="(f, key) in dataByFaction"
                  :key="key"
                  :value="key"
              >
                {{ f.name }}
              </option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">Detachment</label>
            <select
                v-model="detachment"
                :disabled="isCore"
                class="control-select"
                @change="onDetachmentChange"
            >
              <optgroup v-for="group in detachmentGroups" :key="group.label" :label="group.label">
                <option v-for="d in group.options" :key="d.value" :value="d.value">{{ d.label }}</option>
              </optgroup>
            </select>
          </div>

          <div class="control-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="includeCore" :disabled="isCore" class="control-checkbox" type="checkbox"/>
              <span class="checkbox-text">Include Core Stratagems</span>
            </label>
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-btn secondary-btn" @click="resetRemovedCards">
            <span class="btn-icon">⟲</span>
            Reset Removed Cards
          </button>
          <button :disabled="visibleCards.length === 0" class="action-btn primary-btn" @click="openPrintDialog">
            <span class="btn-icon">⎙</span>
            Print Preview ({{ visibleCards.length }} Cards)
          </button>
        </div>
      </section>

      <section v-if="!showPrintPreview" class="cards-section">
        <div v-if="visibleCards.length === 0" class="no-cards-message">
          <h3>No cards available</h3>
          <p>Select a faction and detachment to view available strategem cards.</p>
        </div>
        <Page v-else :cards="visibleCards" :index="0" @remove-card="removeCard"/>
      </section>

      <PrintPreview
          v-if="showPrintPreview"
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
import type {CardData, FactionData} from './types'

const ALL_DETACHMENTS_ONLY_KEY = '(all-detachments)'
const ALL_DETACHMENTS_CP_KEY = '(all-detachments-and-combat-patrols)'
const ALL_DETACHMENTS_ONLY_LABEL = 'All Detachments'
const ALL_DETACHMENTS_CP_LABEL = 'All Detachments (incl. Combat Patrols)'

type FactionGroups = Record<string, string[]>

const dataByFaction = ref<Record<string, FactionData>>({})
const factionGroups = ref<FactionGroups>({})
const Core = ref<CardData[]>([])
const loadError = ref(false)
const removedCardIds = ref<Set<string>>(new Set())
const showPrintPreview = ref(false)

async function loadData() {
  try {
    // Load combined faction metadata
    const metaRes = await fetch("/data/factions.json", { cache: "no-cache" })
    if (!metaRes.ok) throw new Error("Failed to load factions.json")
    const meta = await metaRes.json()

    const factionIdMap = meta.mapping
    factionGroups.value = meta.groups

    // Load CSV
    const csvRes = await fetch("/data/Stratagems.csv", { cache: "no-cache" })
    if (!csvRes.ok) throw new Error("Failed to load Stratagems.csv")
    const csv = await csvRes.text()

    const lines = csv.split("\n").map(l => l.trim())
    const headers = lines[0].split("|").map(h => h.trim())

    const factions: Record<string, FactionData> = {}

    // --- Helpers ---------------------------------------------------------
const cleanHtml = (text: string) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<span class="kwb">/gi, "<b>")
    .replace(/<span class="kwb2">/gi, "<b>")
    .replace(/<\/span>/gi, "</b>")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim()

    const extractSections = (desc: string) => {
      const d = cleanHtml(desc)
      const get = (label: string) => {
        const regex = new RegExp(`${label}:\\s*(.*?)(?=WHEN:|TARGET:|EFFECT:|RESTRICTIONS:|$)`, "is")
        const match = d.match(regex)
        return match ? match[1].trim() : ""
      }
      return {
        when: get("WHEN"),
        target: get("TARGET"),
        effect: get("EFFECT"),
        restrictions: get("RESTRICTIONS")
      }
    }

    const normalizeTiming = (turn: string) => {
      const t = turn.toLowerCase()
      if (t.includes("your")) return "yourTurn"
      if (t.includes("either")) return "anyTurn"
      if (t.includes("opponent")) return "opponentTurn"
      return "anyTurn"
    }

    const normalizePhase = (phase: string) => {
      const p = phase.toLowerCase()
      const map: Record<string, string> = {
        "shooting phase": "shooting",
        "command phase": "command",
        "movement phase": "movement",
        "charge phase": "charge",
        "fight phase": "fight",
        "any phase": "any"
      }
      return map[p] || p
    }

    // --- Parse CSV rows --------------------------------------------------
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue

      const cols = lines[i].split("|")
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => (row[h] = cols[idx]?.trim() ?? ""))

      // --- Determine faction --------------------------------------------
      let factionName: string

      if (row.type?.trim().toLowerCase().startsWith("core")) {
        factionName = "Core"
      } else if (row.faction_id && factionIdMap[row.faction_id]) {
        factionName = factionIdMap[row.faction_id]
      } else {
        factionName = "Unaligned Forces"
      }

      // --- Ensure faction exists ----------------------------------------
      if (!factions[factionName]) {
        factions[factionName] = {
          name: factionName,
          combatPatrols: {},
          detachments: {}
        }
      }

      // --- Determine detachment -----------------------------------------
      const detachmentName =
        row.detachment?.trim() !== "" ? row.detachment.trim() : "(none)"

      // Ensure detachment exists
      if (!factions[factionName].detachments[detachmentName]) {
        factions[factionName].detachments[detachmentName] = []
      }

      // Extract WHEN / TARGET / EFFECT / RESTRICTIONS
      const sections = extractSections(row.description)
      const phases = row.phase ? [normalizePhase(row.phase)] : []

      // --- Push card into correct detachment -----------------------------
      factions[factionName].detachments[detachmentName].push({
        name: row.name,
        cp: Number(row.cp_cost),
        type: row.type.replace("Stratagem", "").trim(),
        group:
          detachmentName === "(none)"
            ? factionName.toUpperCase()
            : `${factionName.toUpperCase()} – ${detachmentName}`,
        timing: normalizeTiming(row.turn),
        phases,
        when: sections.when,
        target: sections.target,
        effect: sections.effect,
        restrictions: sections.restrictions,
        id: row.id || crypto.randomUUID()
      })
    }

    // --- Assign to Vue state --------------------------------------------
    dataByFaction.value = factions
    Core.value = factions.Core?.detachments["(none)"] || []

    loadError.value = false

  } catch (e) {
    console.warn("Failed to load factions.json or Stratagems.csv", e)
    loadError.value = true
  }
}

loadData()

const faction = ref('Core')
const detachment = ref('(none)')
const includeCore = ref(true)

const isCore = computed(() => faction.value === 'Core')

const allCards = computed(() => {
  const all: CardData[] = []
  if (faction.value !== 'Core') {
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
  }
  if (includeCore.value) all.push(...Core.value)
  if (faction.value === 'Core' && detachment.value === '(none)' && !includeCore.value) return []
  return all
})

const visibleCards = computed(() => {
  return allCards.value.filter(card => !removedCardIds.value.has(getCardId(card)))
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

  if (army.length) groups.push({label: 'Army Detachments', options: army.map(n => ({value: n, label: n}))})
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

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--w40k-bg);
}

.app-header {
  text-align: center;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--w40k-border);
  margin-bottom: 32px;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--w40k-gold);
  margin: 40px 20px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.app-title img {
  height: 60px;
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
}

.app-description {
  font-size: 1rem;
  color: var(--w40k-text-muted);
  max-width: 800px;
  margin: 10px auto;
  line-height: 1.6;
}

.controls-section {
  background: var(--w40k-surface);
  border: 1px solid var(--w40k-border);
  padding: 32px;
  margin-bottom: 32px;
}

@media (min-width: 1024px) {
  .controls-section {
    position: sticky;
    top: 0;
    z-index: 9999;
  }

  .print-preview-active .controls-section {
    position: static !important;
    top: auto !important;
  }
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-group {
  justify-content: center;
  margin-top: 20px;
}

.control-label {
  font-weight: 700;
  color: var(--w40k-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.control-select {
  padding: 12px 16px;
  background: var(--w40k-dropdown);
  border: 1px solid var(--w40k-border);
  color: var(--w40k-text);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
}

.control-select:focus {
  border-color: var(--w40k-accent);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 1rem;
  color: var(--w40k-text);
}

.control-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--w40k-accent);
}

.checkbox-text {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid var(--w40k-border);
  padding-top: 24px;
}

.action-btn {
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
  font-family: inherit;
}

.primary-btn {
  background: var(--w40k-accent);
  border-color: var(--w40k-accent);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: var(--w40k-accent-hover);
  border-color: var(--w40k-accent-hover);
}

.secondary-btn:hover {
  background: var(--w40k-surface-light);
  border-color: var(--w40k-text-muted);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

.cards-section {
  margin-top: 32px;
}

.no-cards-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--w40k-text-muted);
  background: var(--w40k-surface);
  border: 1px solid var(--w40k-border);
  margin: 20px 0;
}

.no-cards-message h3 {
  color: var(--w40k-gold);
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.no-cards-message p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 8px;
  }

  .controls-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    justify-content: center;
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}

/* Print styles */
@media print {
  .app-container {
    background: none !important;
  }

  .container {
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .app-header,
  .controls-section {
    display: none !important;
  }

  .cards-section {
    display: none !important;
  }

  body {
    margin: 0;
    padding: 0;
    background: white !important;
  }
}
</style>