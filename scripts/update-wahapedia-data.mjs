import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { tmpdir } from 'node:os'

const EDITIONS = [
  {
    id: '10',
    label: '10th Edition',
    slug: 'wh40k10ed',
    sourceUrl: 'https://wahapedia.ru/wh40k10ed/the-rules/data-export/',
  },
  {
    id: '11',
    label: '11th Edition',
    slug: 'wh40k11ed',
    sourceUrl: 'https://wahapedia.ru/wh40k11ed/the-rules/data-export/',
  },
]

const FACTION_GROUPS = {
  'Forces of the Imperium': [
    'Adepta Sororitas',
    'Adeptus Custodes',
    'Adeptus Mechanicus',
    'Astra Militarum',
    'Grey Knights',
    'Imperial Knights',
    'Space Marines',
    'Imperial Agents',
    'Imperial Navy',
    'Adeptus Arbites',
    'The Inquisition',
  ],
  'Forces of Chaos': [
    'Chaos Space Marines',
    'Chaos Daemons',
    'Chaos Knights',
    'Death Guard',
    'Thousand Sons',
    'World Eaters',
    'Emperor’s Children',
  ],
  Xenos: [
    'Aeldari',
    'Drukhari',
    'Harlequins',
    'Ynnari',
    'Necrons',
    'T’au Empire',
    'Genestealer Cults',
    'Orks',
    'Leagues of Votann',
    'Tyranids',
  ],
  Other: [
    'Adeptus Titanicus',
    'Unaligned Forces',
    'Unbound Adversaries',
    'Core',
  ],
}

const PHASES = ['command', 'movement', 'shooting', 'charge', 'fight']

async function main() {
  const selectedIds = parseEditionArgs()
  const editions = EDITIONS.filter((edition) => selectedIds.has(edition.id))

  for (const edition of editions) {
    const outputDir = join('public', 'data', edition.id)
    await mkdir(outputDir, { recursive: true })

    const specUrl = `https://wahapedia.ru/${edition.slug}/Export%20Data%20Specs.xlsx`
    const spec = await downloadBuffer(specUrl)
    const csvLinks = extractCsvLinks(spec, edition.slug)
    const required = await downloadRequiredCsvs(csvLinks)
    const data = buildCardsJson(required, edition)

    await writeFile(join(outputDir, 'cards.json'), `${JSON.stringify(data, null, 2)}\n`)
    console.log(`${edition.label}: wrote ${countCards(data)} cards to ${outputDir}/cards.json`)
  }

  await writeFile(
    join('public', 'data', 'editions.json'),
    `${JSON.stringify({ editions: EDITIONS.map(({ id, label, sourceUrl }) => ({ id, label, sourceUrl })) }, null, 2)}\n`,
  )
}

function parseEditionArgs() {
  const arg = process.argv.find((value) => value.startsWith('--edition='))
  if (!arg) return new Set(EDITIONS.map((edition) => edition.id))

  const requested = arg.replace('--edition=', '').split(',').map((value) => value.trim())
  const known = new Set(EDITIONS.map((edition) => edition.id))
  for (const id of requested) {
    if (!known.has(id)) {
      throw new Error(`Unknown edition "${id}". Known editions: ${[...known].join(', ')}`)
    }
  }
  return new Set(requested)
}

async function downloadBuffer(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

function extractCsvLinks(spec, editionSlug) {
  const tempDir = mkdtempSync(join(tmpdir(), 'wahapedia-spec-'))
  const specFile = join(tempDir, 'spec.xlsx')
  writeFileSync(specFile, spec)

  try {
    const rels = execFileSync('unzip', ['-p', specFile, 'xl/worksheets/_rels/sheet1.xml.rels'], {
      encoding: 'utf8',
    })

    const links = new Map()
    for (const match of rels.matchAll(/Target="([^"]+\.csv)"/g)) {
      const url = decodeXml(match[1]).replace(/\/wh40k\d+ed\//, `/${editionSlug}/`)
      links.set(basename(new URL(url).pathname), url)
    }

    if (!links.size) {
      throw new Error('No CSV links found in Wahapedia export spec')
    }

    return links
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

async function downloadRequiredCsvs(csvLinks) {
  const requiredNames = ['Factions.csv', 'Stratagems.csv', 'Last_update.csv']
  const result = {}

  for (const name of requiredNames) {
    const url = csvLinks.get(name)
    if (!url) throw new Error(`Required CSV ${name} was not linked from the export spec`)
    result[name] = (await downloadBuffer(url)).toString('utf8')
  }

  return result
}

function buildCardsJson(files, edition) {
  const factionsRows = parsePipeCsv(files['Factions.csv'])
  const stratagemRows = parsePipeCsv(files['Stratagems.csv'])
  const lastUpdateRows = parsePipeCsv(files['Last_update.csv'])
  const factionIdMap = Object.fromEntries(factionsRows.map((row) => [row.id, row.name]))
  factionIdMap.CORE = 'Core'

  const factions = {}

  for (const row of stratagemRows) {
    if (!row.name) continue

    const factionName = getFactionName(row, factionIdMap)
    const detachmentName = row.detachment?.trim() || '(none)'
    const container = getFactionContainer(factions, factionName)
    const sections = extractSections(row.description || '')
    const phases = normalizePhases(row.phase || '')

    if (!container.detachments[detachmentName]) {
      container.detachments[detachmentName] = []
    }

    container.detachments[detachmentName].push({
      id: row.id,
      name: row.name,
      cp: Number.parseInt(row.cp_cost, 10) || 0,
      type: normalizeType(row.type || ''),
      group: detachmentName === '(none)' ? factionName.toUpperCase() : `${factionName.toUpperCase()} - ${detachmentName}`,
      timing: normalizeTiming(row.turn || ''),
      phases,
      when: sections.when,
      target: sections.target,
      effect: sections.effect,
      restrictions: sections.restrictions,
    })
  }

  sortFactionData(factions)

  return {
    edition: edition.id,
    editionLabel: edition.label,
    sourceUrl: edition.sourceUrl,
    lastUpdate: lastUpdateRows[0]?.last_update || '',
    factionGroups: FACTION_GROUPS,
    factions,
  }
}

function parsePipeCsv(csv) {
  const normalized = csv.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n').filter((line) => line.length > 0)
  if (!lines.length) return []

  const headers = splitPipeLine(lines[0]).map((header) => header.trim()).filter(Boolean)
  return lines.slice(1).map((line) => {
    const cols = splitPipeLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cols[index]?.trim() || '']))
  })
}

function splitPipeLine(line) {
  const cols = line.split('|')
  if (cols.at(-1) === '') cols.pop()
  return cols
}

function getFactionName(row, factionIdMap) {
  if (row.type?.toLowerCase().startsWith('core')) return 'Core'
  if (!row.faction_id) return 'Core'
  return factionIdMap[row.faction_id] || 'Unaligned Forces'
}

function getFactionContainer(factions, factionName) {
  if (!factions[factionName]) {
    factions[factionName] = {
      name: factionName === 'Core' ? 'Core Rules' : factionName,
      combatPatrols: {},
      detachments: {},
    }
  }
  return factions[factionName]
}

function extractSections(description) {
  const text = cleanHtml(description)
  const get = (label) => {
    const regex = new RegExp(`${label}:\\s*(.*?)(?=WHEN:|TARGET:|EFFECT:|RESTRICTIONS:|$)`, 'is')
    return text.match(regex)?.[1]?.trim() || ''
  }

  return {
    when: get('WHEN'),
    target: get('TARGET'),
    effect: get('EFFECT'),
    restrictions: get('RESTRICTIONS'),
  }
}

function cleanHtml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<span class="kwb2?">/gi, '<b>')
    .replace(/<b>\s*(WHEN|TARGET|EFFECT|RESTRICTIONS):\s*<\/b>/gi, '$1:')
    .replace(/<\/span>/gi, '</b>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeType(type) {
  const withoutSuffix = type.replace(/\s*Stratagem\s*$/i, '').trim()
  const parts = withoutSuffix.split(/\s+[–-]\s+/)
  return parts.at(-1)?.trim() || withoutSuffix
}

function normalizeTiming(turn) {
  const value = turn.toLowerCase()
  if (value.includes('opponent')) return 'oppTurn'
  if (value.includes('your')) return 'yourTurn'
  if (value.includes('either') || value.includes('any')) return 'anyTurn'
  return 'anyTurn'
}

function normalizePhases(phase) {
  const value = phase.toLowerCase()
  if (!value || value.includes('any')) return [...PHASES]
  return PHASES.filter((candidate) => value.includes(candidate))
}

function sortFactionData(factions) {
  for (const faction of Object.values(factions)) {
    faction.detachments = sortRecord(faction.detachments)
    faction.combatPatrols = sortRecord(faction.combatPatrols)
    for (const cards of Object.values(faction.detachments)) {
      cards.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
}

function sortRecord(record) {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)))
}

function countCards(data) {
  return Object.values(data.factions).reduce((total, faction) => {
    return total + Object.values(faction.detachments).reduce((sum, cards) => sum + cards.length, 0)
  }, 0)
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
