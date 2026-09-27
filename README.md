# Warhammer 40K Stratagem Card Generator

## Description
Generate and print Warhammer 40,000 stratagem cards sized for 2.5″ × 3.5″ sleeves. Built with Vue 3 + Vite.

Available at [stratagemprint40k.app](https://stratagemprint40k.app).

## Requirements
- **Node.js**: 22.12+ (Vite 5 compatible)
- **Dependencies**: Vue 3
- **Dev tooling**: Vite 5, TypeScript 5, `@vitejs/plugin-vue`

## Setup
```bash
# 1) Install
npm install

# 2) Start dev server
npm run dev

# 3) Build for production
npm run build

# (Optional) Preview the production build
npm run preview

# Refresh Wahapedia data for all configured editions
npm run update:data

# Or refresh a single edition
npm run update:data -- --edition=11
```

## How to collaborate

Generated game data lives under **`public/data/<edition>/cards.json`**. The edition selector is driven by **`public/data/editions.json`**.

Run `npm run update:data` to download Wahapedia’s export overview workbook, follow its linked CSV exports, and rebuild the 10th and 11th Edition JSON files.

### Top-level structure
```json
{
  "edition": "11",
  "editionLabel": "11th Edition",
  "sourceUrl": "https://wahapedia.ru/wh40k11ed/the-rules/data-export/",
  "lastUpdate": "YYYY-MM-DD HH:mm:ss",
  "factionGroups": {
    "<GroupName>": ["<FactionName>"]
  },
  "factions": {
    "<FactionKey>": {
      "name": "<Display Name>",
      "combatPatrols": {
        "<CombatPatrolName>": []
      },
      "detachments": {
        "<DetachmentName>": []
      }
    }
  }
}
```

- `factionGroups` clusters factions into headings (e.g., *Forces of the Imperium*, *Forces of Chaos*, *Xenos*).
- `factions` holds each faction’s **combatPatrols** and **detachments**; each is an array of stratagem objects.

### Stratagem object format
```json
{
  "name": "STRING",
  "flavor": "STRING",
  "cp": 1,
  "type": "STRING (Wahapedia stratagem category)",
  "timing": "yourTurn | oppTurn | anyTurn | everyTurn",
  "phases": ["command", "movement", "shooting", "charge", "fight"],
  "when": "STRING (rules timing text)",
  "target": "STRING (who/what it targets)",
  "effect": "STRING (rules effect)",
  "restrictions": "STRING (can be empty)",
  "group": "STRING (optional label, e.g. 'CORE' or 'FACTION – Detachment')"
}
```

The 11th Edition keeps Wahapedia’s full category labels such as `Epic Deed Stratagem`; the 10th Edition keeps the generator’s existing shortened category labels for backwards-compatible rendering.

### Contribution guidelines
1. **Prefer generated data**: update `scripts/update-wahapedia-data.mjs` when Wahapedia changes its export schema.
2. **Add editions** in the script’s `SCRAPED_EDITIONS` list; the job rewrites stale workbook links to that edition’s Wahapedia path.
3. **Do not hand-edit generated card data** unless necessary; regenerate it before release.
4. **Validate locally**: run `npm run build` and test the affected faction/detachment; fix any console errors or rendering issues.
5. **Keep diffs clean**: 2-space indentation, stable key ordering, no trailing commas.
