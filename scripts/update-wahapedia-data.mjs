import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { tmpdir } from 'node:os'

// Editions with a Wahapedia data export. Each edition's export workbook links its CSV files;
// extractCsvLinks rewrites any link pointing at another edition's path to the target edition.
//
// format: 'legacy' keeps the plain WHEN/TARGET/EFFECT/RESTRICTIONS text the 10th Edition cards
// render; 'structured' keeps Wahapedia's markup (lists, modes, ability sections) for 11th.
//
// coreGroups sorts faction-less rows into Core "detachments" by their Wahapedia type; the first
// matching pattern wins and a null detachment drops the row. Unmatched rows fall back to
// getCoreDetachment's defaults.
const SCRAPED_EDITIONS = [
  {
    id: '10',
    label: '10th Edition',
    slug: 'wh40k10ed',
    sourceUrl: 'https://wahapedia.ru/wh40k10ed/the-rules/data-export/',
    format: 'legacy',
    coreGroups: [],
  },
  {
    id: '11',
    label: '11th Edition',
    slug: 'wh40k11ed',
    sourceUrl: 'https://wahapedia.ru/wh40k11ed/the-rules/data-export/',
    format: 'structured',
    coreGroups: [
      // The 11th Edition export still carries the 10th Edition Core Stratagems, which the
      // 11th Edition "Core Stratagem" entries replace.
      [/^Core – /, null],
      [/^Core Stratagem – /, 'Mission Pack'],
      [/ Ability$/, 'Core Abilities'],
    ],
  },
]

const ALL_EDITIONS = [...SCRAPED_EDITIONS]

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
const REQUIRED_CSVS = ['Factions.csv', 'Stratagems.csv', 'Last_update.csv']
const TYPE_SEPARATOR = /\s+[–-]\s+/

async function main() {
  const selectedIds = parseEditionArgs()
  const sourceDir = parseSourceDirArg()
  const editions = SCRAPED_EDITIONS.filter((edition) => selectedIds.has(edition.id))

  for (const edition of editions) {
    const outputDir = join('public', 'data', edition.id)
    await mkdir(outputDir, { recursive: true })

    const required = sourceDir
      ? await readLocalCsvs(join(sourceDir, edition.slug))
      : await downloadRequiredCsvs(extractCsvLinks(await downloadBuffer(specUrlFor(edition)), edition.slug))
    const data = buildCardsJson(required, edition)

    await writeFile(join(outputDir, 'cards.json'), `${JSON.stringify(data, null, 2)}\n`)
    console.log(`${edition.label}: wrote ${countCards(data)} cards to ${outputDir}/cards.json`)
  }

  await writeFile(
    join('public', 'data', 'editions.json'),
    `${JSON.stringify({ editions: ALL_EDITIONS.map(({ id, label, sourceUrl }) => ({ id, label, sourceUrl })) }, null, 2)}\n`,
  )
}

function parseEditionArgs() {
  const arg = process.argv.find((value) => value.startsWith('--edition='))
  if (!arg) return new Set(ALL_EDITIONS.map((edition) => edition.id))

  const requested = arg.replace('--edition=', '').split(',').map((value) => value.trim())
  const known = new Set(ALL_EDITIONS.map((edition) => edition.id))
  for (const id of requested) {
    if (!known.has(id)) {
      throw new Error(`Unknown edition "${id}". Known editions: ${[...known].join(', ')}`)
    }
  }
  return new Set(requested)
}

// --from=<dir> reads previously downloaded exports from <dir>/<edition slug>/<file>.csv
// instead of fetching them, e.g. when wahapedia.ru is not reachable from the build machine.
function parseSourceDirArg() {
  return process.argv.find((value) => value.startsWith('--from='))?.replace('--from=', '') || ''
}

function specUrlFor(edition) {
  return `https://wahapedia.ru/${edition.slug}/Export%20Data%20Specs.xlsx`
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
  const result = {}

  for (const name of REQUIRED_CSVS) {
    const url = csvLinks.get(name)
    if (!url) throw new Error(`Required CSV ${name} was not linked from the export spec`)
    result[name] = (await downloadBuffer(url)).toString('utf8')
  }

  return result
}

async function readLocalCsvs(dir) {
  const result = {}
  for (const name of REQUIRED_CSVS) {
    result[name] = await readFile(join(dir, name), 'utf8')
  }
  return result
}

function buildCardsJson(files, edition) {
  const factionsRows = parsePipeCsv(files['Factions.csv'])
  const stratagemRows = parsePipeCsv(files['Stratagems.csv'])
  const lastUpdateRows = parsePipeCsv(files['Last_update.csv'])
  const factionIdMap = Object.fromEntries(factionsRows.map((row) => [row.id, row.name]))

  const factions = {}

  for (const row of stratagemRows) {
    if (!row.name) continue

    const factionName = row.faction_id ? factionIdMap[row.faction_id] || 'Unaligned Forces' : 'Core'
    const detachmentName = factionName === 'Core'
      ? getCoreDetachment(row.type, edition)
      : row.detachment || '(none)'
    if (detachmentName === null) continue

    const group = detachmentName === '(none)'
      ? factionName.toUpperCase()
      : `${factionName.toUpperCase()} - ${detachmentName}`
    const card = edition.format === 'structured'
      ? buildStructuredCard(row, group)
      : buildLegacyCard(row, group)

    const container = getFactionContainer(factions, factionName)
    container.detachments[detachmentName] ??= []
    container.detachments[detachmentName].push(card)
  }

  dedupeCards(factions)
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

// Wahapedia's exports are pipe-separated with a trailing "|" on every line, and some fields
// (mostly legends) contain raw line breaks, so records can't be split on newlines. Fields never
// contain "|", so the text is split on that instead and regrouped by the header's column count;
// the first field of each record then starts with the previous record's line break.
function parsePipeCsv(csv) {
  const normalized = csv.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const headerEnd = normalized.indexOf('\n')
  if (headerEnd === -1) return []

  const headers = normalized.slice(0, headerEnd).split('|').map((header) => header.trim())
  if (headers.at(-1) === '') headers.pop()

  const tokens = normalized.slice(headerEnd + 1).split('|')
  const rows = []
  for (let start = 0; start + headers.length <= tokens.length; start += headers.length) {
    const cols = tokens.slice(start, start + headers.length)
    rows.push(Object.fromEntries(headers.map((header, index) => [header, cols[index].trim()])))
  }
  return rows
}

function getCoreDetachment(type, edition) {
  const match = edition.coreGroups.find(([pattern]) => pattern.test(type))
  if (match) return match[1]

  // "Core – Battle Tactic Stratagem" and "Core Stratagem" are the Core Stratagems; other
  // prefixes name the game mode they belong to, e.g. "Boarding Actions – Epic Deed Stratagem".
  const parts = type.split(TYPE_SEPARATOR)
  if (parts.length < 2 || /^Core( Stratagem)?$/i.test(parts[0])) return '(none)'
  return parts[0]
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

function cleanName(name) {
  // Wahapedia occasionally uses non-breaking hyphens, which the card fonts don't all have.
  return name.replace(/‑/g, '-').replace(/\s+/g, ' ').trim()
}

function cleanFlavor(legend) {
  return legend.replace(/\s+/g, ' ').trim()
}

// --- 10th Edition (legacy text format) ---------------------------------------------------

function buildLegacyCard(row, group) {
  const sections = extractLegacySections(row.description || '')
  const card = {
    id: row.id,
    name: cleanName(row.name),
    flavor: cleanLegacyHtml(cleanFlavor(row.legend || '')),
    cp: Number.parseInt(row.cp_cost, 10) || 0,
    type: normalizeLegacyType(row.type || '') || agileManoeuvreType(row.description || ''),
    group,
    timing: normalizeTiming(row.turn || ''),
    phases: normalizeLegacyPhases(row.phase || ''),
    when: sections.when || sections.trigger,
    target: sections.target,
    effect: sections.effect,
    restrictions: sections.restrictions,
  }
  if (!row.cp_cost) card.noCp = true
  return card
}

function extractLegacySections(description) {
  const text = cleanLegacyHtml(description)
  const get = (label) => {
    const regex = new RegExp(`${label}:\\s*(.*?)(?=WHEN:|TARGET:|EFFECT:|RESTRICTIONS?:|TRIGGER:|$)`, 'is')
    return text.match(regex)?.[1]?.trim() || ''
  }

  return {
    when: get('WHEN'),
    trigger: get('TRIGGER'),
    target: get('TARGET'),
    effect: get('EFFECT'),
    restrictions: get('RESTRICTIONS?'),
  }
}

function cleanLegacyHtml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    // Aeldari Agile Manoeuvres: phase icons and TRIGGER/EFFECT labels.
    .replace(/<div class="(?:redDiamondLeft|bluCircle2|ae\w+)"><\/div>/gi, '')
    .replace(/<div class="(?:redDiamondLeft|bluCircle2)">|<\/div>/gi, '')
    .replace(/<span class="aeText">([^<]*)<\/span>/gi, '$1')
    .replace(/<span class="kwb2?">/gi, '<b>')
    .replace(/<b>\s*(WHEN|TARGET|EFFECT|RESTRICTIONS?):\s*<\/b>/gi, '$1:')
    .replace(/<b>\s*(WHEN|TARGET|EFFECT|RESTRICTIONS?)\s*<\/b>\s*:/gi, '$1:')
    .replace(/<\/span>/gi, '</b>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeLegacyType(type) {
  const parts = type.trim().split(TYPE_SEPARATOR)
  const category = parts.at(-1)?.trim() || type.trim()
  // "Serpent’s Brood – Stratagem" has no category, so fall back to the detachment prefix.
  return category.replace(/\s*Stratagem\s*$/i, '').trim() || parts[0].trim()
}

function normalizeLegacyPhases(phase) {
  const value = phase.toLowerCase()
  if (!value || value.includes('any')) return [...PHASES]
  return PHASES.filter((candidate) => value.includes(candidate))
}

// --- 11th Edition (structured format) ----------------------------------------------------

const SECTION_LABEL_SOURCE =
  'WHEN|TARGET|EFFECT|RESTRICTIONS?|ELIGIBLE IF|TRIGGER|MAXIMUM DISTANCE|SET-UP DISTANCE|(?:BEFORE|WHILE|AFTER) [A-Z]+'
const SECTION_LABEL = new RegExp(`^(?:${SECTION_LABEL_SOURCE})$`)
const STANDARD_LABELS = new Set(['WHEN', 'TARGET', 'EFFECT', 'RESTRICTIONS'])
const ABILITY_PHASES = { move: 'movement', shoot: 'shooting', fight: 'fight' }

function buildStructuredCard(row, group) {
  const description = row.description || ''
  const noCp = !row.cp_cost
  const card = {
    id: row.id,
    name: cleanName(row.name),
    flavor: escapeHtml(cleanFlavor(decodeEntities(row.legend || ''))),
    cp: Number.parseInt(row.cp_cost, 10) || 0,
    ...(noCp && { noCp: true }),
    type: normalizeStructuredType(row, description),
    group,
    timing: normalizeTiming(row.turn || ''),
    phases: normalizeStructuredPhases(row.phase || ''),
    when: '',
    target: '',
    effect: '',
    restrictions: '',
  }

  const sections = splitSections(parseHtml(normalizeSectionLabels(description)))
  const byLabel = new Map(sections.map((section) => [section.label, section]))
  const isStratagem = !noCp
    && byLabel.has('WHEN')
    && byLabel.has('EFFECT')
    && sections.every((section) => STANDARD_LABELS.has(section.label) && !section.boxed)

  if (isStratagem) {
    const effect = extractModes(byLabel.get('EFFECT').nodes)
    card.when = renderSection(byLabel.get('WHEN').nodes)
    card.target = renderSection(byLabel.get('TARGET')?.nodes || [])
    card.effect = effect.html
    card.restrictions = renderSection(byLabel.get('RESTRICTIONS')?.nodes || [])
    if (effect.modes.length) card.modes = effect.modes
  } else {
    card.sections = sections
      .map((section) => ({
        label: section.label ? `${section.label}:` : '',
        html: listDashedLines(renderSection(section.nodes)),
        ...(section.boxed && { boxed: true }),
      }))
      .filter((section) => section.html)
  }

  return card
}

// The Aeldari army rule's Agile Manoeuvres come without a type; their TRIGGER/EFFECT markup
// gives them away.
function agileManoeuvreType(description) {
  return description.includes('class="aeText"') ? 'Agile Manoeuvre' : ''
}

function normalizeStructuredType(row, description) {
  const type = row.type.trim()
  if (!type) return agileManoeuvreType(description)
  // Wahapedia files the Fight abilities under "Shooting Ability".
  if (/ability "fight"/i.test(row.phase)) return type.replace(/^Shooting Ability$/, 'Fight Ability')
  return type.split(TYPE_SEPARATOR).at(-1).trim()
}

function normalizeStructuredPhases(phase) {
  const value = phase.toLowerCase()
  const ability = value.match(/ability "(\w+)"/)
  if (ability) return ABILITY_PHASES[ability[1]] ? [ABILITY_PHASES[ability[1]]] : []
  if (!value) return []
  if (value.includes('any')) return ['any']
  return PHASES.filter((candidate) => value.includes(candidate))
}

// Section labels arrive as "<b>WHEN:</b>", "<b>WHEN</b>:", "<span class="aeText">TRIGGER:</span>"
// or as plain "WHEN:" text; rewrite them all to the first form so splitSections can find them.
function normalizeSectionLabels(html) {
  return html
    .replace(new RegExp(`<span class="aeText">\\s*(${SECTION_LABEL_SOURCE}):\\s*</span>`, 'g'), '<b>$1:</b>')
    .replace(new RegExp(`<b>\\s*(${SECTION_LABEL_SOURCE})\\s*</b>\\s*:`, 'g'), '<b>$1:</b>')
    .replace(new RegExp(`(^|<br\\s*/?>|</div>|<div[^>]*>)\\s*(${SECTION_LABEL_SOURCE}):`, 'g'), '$1<b>$2:</b>')
}

const VOID_TAGS = new Set(['br', 'hr', 'img'])

// A small, forgiving HTML tree builder: Wahapedia's markup is mostly well-formed, but has the odd
// stray closing tag, which is ignored unless it closes an element that is actually open.
function parseHtml(html) {
  const root = { tag: '#root', classes: [], children: [] }
  const stack = [root]

  for (const match of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+|<)/g)) {
    const parent = stack.at(-1)
    if (match[4] !== undefined) {
      parent.children.push({ text: decodeEntities(match[4]) })
      continue
    }

    const tag = match[2].toLowerCase()
    if (match[1]) {
      const index = stack.map((node) => node.tag).lastIndexOf(tag)
      if (index > 0) stack.length = index
      continue
    }

    const classes = (match[3].match(/class="([^"]*)"/)?.[1] || '').split(/\s+/).filter(Boolean)
    const node = { tag, classes, children: [] }
    parent.children.push(node)
    if (!VOID_TAGS.has(tag) && !match[3].trim().endsWith('/')) stack.push(node)
  }

  return root.children
}

function splitSections(nodes) {
  const sections = []
  let current = { label: '', nodes: [] }
  const flush = () => {
    if (current.label || hasContent(current.nodes)) sections.push(current)
  }

  for (const node of nodes) {
    const label = sectionLabelOf(node)
    if (label) {
      flush()
      current = { label, nodes: [] }
    } else if (hasClass(node, 'strGreyBg')) {
      // The grey box at the top of move abilities: "MAXIMUM DISTANCE: …" or "SET-UP DISTANCE: …".
      flush()
      const [first, ...rest] = node.children
      const boxLabel = sectionLabelOf(first)
      sections.push({ label: boxLabel, nodes: boxLabel ? rest : node.children, boxed: true })
      current = { label: '', nodes: [] }
    } else {
      current.nodes.push(node)
    }
  }
  flush()

  return sections
}

function sectionLabelOf(node) {
  if (node?.tag !== 'b') return ''
  const label = textOf(node).trim().match(/^(.+?)\s*:$/)?.[1]
  if (!label || !SECTION_LABEL.test(label)) return ''
  return label === 'RESTRICTION' ? 'RESTRICTIONS' : label
}

// Effects that offer a choice list each option as "<span class="redPad">Name:</span> text";
// options that cost extra CP sit in a "str11Text2" block with a "+1CP" badge. These become
// card modes, which render as labeled rows with a CP band on the rail.
function extractModes(nodes) {
  const modes = []
  const rest = []

  for (const node of nodes) {
    if (isModeList(node)) {
      modes.push(...modesFromList(node, 0))
    } else if (hasClass(node, 'str11Text2')) {
      const badge = node.children.find((child) => hasClass(child, 'str11CP2'))
      const cpModifier = Number.parseInt(textOf(badge || { children: [] }).match(/\+(\d+)/)?.[1], 10) || 0
      const inner = node.children.filter((child) => child !== badge)
      const lists = inner.filter(isModeList)
      if (lists.length) {
        for (const list of lists) modes.push(...modesFromList(list, cpModifier))
      } else {
        // An unnamed alternative, e.g. "<u>Or:</u> Ranged attacks that target your unit …".
        const [first, ...others] = meaningfulNodes(inner)
        const name = /^(u|b|i)$/.test(first?.tag) && /:\s*$/.test(textOf(first)) ? textOf(first) : ''
        modes.push(makeMode(name || 'Or', name ? others : inner, cpModifier))
      }
    } else {
      rest.push(node)
    }
  }

  return { html: renderSection(rest), modes }
}

function isModeList(node) {
  if (node.tag !== 'ul' && node.tag !== 'ol') return false
  const items = node.children.filter((child) => child.tag === 'li')
  return items.length > 0 && items.every((item) => hasClass(meaningfulNodes(item.children)[0], 'redPad'))
}

function modesFromList(list, cpModifier) {
  return list.children
    .filter((child) => child.tag === 'li')
    .map((item) => {
      const [tag, ...rest] = meaningfulNodes(item.children)
      return makeMode(textOf(tag), rest, cpModifier)
    })
}

function makeMode(name, nodes, cpModifier) {
  const mode = { name: name.replace(/:\s*$/, '').trim() }
  if (cpModifier) mode.cpModifier = cpModifier
  mode.effect = renderSection(nodes)
  return mode
}

function renderSection(nodes) {
  return mergeKeywords(renderNodes(nodes))
    .replace(/<\/b>(\s*)<b>/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/(?:\s*<br>)+\s*(?=<(?:ul|ol)>)/g, '')
    .replace(/(<\/(?:ul|ol)>)(?:\s*<br>)+/g, '$1')
    .replace(/(?:<br>\s*){3,}/g, '<br><br>')
    .replace(/^(?:\s|<br>)+|(?:\s|<br>)+$/g, '')
}

// "<b>- Rapid Disembark:</b> 3"<br><b>- Combat Disembark:</b> 6"" (indented with &nbsp;) is a
// list in all but markup; make it one so it doesn't run on from the section label.
function listDashedLines(html) {
  const lines = html.split('<br>')
  const dashed = /^(<b>)?\s*-\s+/
  if (lines.length < 2 || !lines.every((line) => dashed.test(line))) return html
  return `<ul>${lines.map((line) => `<li>${line.replace(dashed, '$1')}</li>`).join('')}</ul>`
}

// Wahapedia wraps each word of a keyword separately ("[INDIRECT" "FIRE]"); join neighbours.
function mergeKeywords(html) {
  const adjacent = /(<span class="kw">[^<]*)<\/span>(\s*)<span class="kw">/g
  let merged = html
  while (adjacent.test(merged)) merged = merged.replace(adjacent, '$1$2')
  return merged
}

function renderNodes(nodes) {
  return nodes.map(renderNode).join('')
}

function renderNode(node) {
  if ('text' in node) return escapeHtml(node.text)

  const inner = renderNodes(node.children)
  if (hasClass(node, 'redPad')) return `<span class="mode-tag">${inner}</span>`
  if (hasClass(node, 'kwb') || hasClass(node, 'kwb2')) return `<span class="kw">${inner}</span>`
  if (hasClass(node, 'blueAbility')) return `<div class="ability-box">${inner}</div>`
  if (hasClass(node, 'str11CP2')) return `<span class="cp-alt-badge">${inner}</span>`
  if (hasClass(node, 'str11Text2')) return `<div class="cp-alt">${inner}</div>`
  // Section dividers, decorative phase icons and designer's commentary boxes.
  if (['str11Line', 'redDiamondLeft', 'blackComment'].some((cls) => hasClass(node, cls))) return ''

  switch (node.tag) {
    case 'br':
      return '<br>'
    case 'b':
    case 'strong':
      return inner.trim() ? `<b>${inner}</b>` : inner
    case 'u':
      return `<u>${inner}</u>`
    case 'i':
    case 'em':
      return `<i>${inner}</i>`
    case 'ul':
    case 'ol':
    case 'li':
      return `<${node.tag}>${inner}</${node.tag}>`
    default:
      return inner
  }
}

function meaningfulNodes(nodes) {
  return nodes.filter((node) => ('text' in node ? node.text.trim() : node.tag !== 'br'))
}

function hasContent(nodes) {
  return renderSection(nodes) !== ''
}

function hasClass(node, cls) {
  return Boolean(node?.classes?.includes(cls))
}

function textOf(node) {
  if ('text' in node) return node.text
  return node.children.map(textOf).join('')
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// --- Shared ------------------------------------------------------------------------------

function normalizeTiming(turn) {
  const value = turn.toLowerCase()
  if (value.includes('opponent')) return 'oppTurn'
  if (value.includes('your')) return 'yourTurn'
  return 'anyTurn'
}

// Wahapedia lists some Core entries several times (once per mission pack or rules page they
// appear in); keep the most recently added entry (the highest id) of each name.
function dedupeCards(factions) {
  for (const faction of Object.values(factions)) {
    for (const [detachment, cards] of Object.entries(faction.detachments)) {
      const byName = new Map()
      for (const card of cards) {
        const key = card.name.toUpperCase()
        const existing = byName.get(key)
        if (!existing || card.id > existing.id) byName.set(key, card)
      }
      faction.detachments[detachment] = [...byName.values()]
    }
  }
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
