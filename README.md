# WH40K Stratagem Card Generator (Vue)

## Description
Generate and print Warhammer 40,000 stratagem cards sized for 2.5″ × 3.5″ sleeves. Built with Vue 3 + Vite.

## Requirements
- **Node.js**: 18+ (Vite 5 compatible)
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
```

## How to collaborate

All game data lives in **`cards.json`** at the project root. Keep entries consistent so the UI and print output remain predictable.

### Top-level structure
```json
{
  "factionGroups": {
    "<GroupName>": ["<FactionName>"]
  },
  "factions": {
    "<FactionKey>": {
      "name": "<Display Name>",
      "combatPatrols": {
        "<CombatPatrolName>": []    // List of Stratagem objects
      },
      "detachments": {
        "<DetachmentName>": []      // List of Stratagem objects
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
  "cp": 1,
  "type": "Battle Tactic | Strategic Ploy | Epic Deed | Wargear",
  "timing": "yourTurn | oppTurn | anyTurn | everyTurn",
  "phases": ["command", "movement", "shooting", "charge", "fight"],
  "when": "STRING (rules timing text)",
  "target": "STRING (who/what it targets)",
  "effect": "STRING (rules effect)",
  "restrictions": "STRING (can be empty)",
  "group": "STRING (optional label, e.g., 'CORE or 'FACTION – Detachment')"
}
```

### Contribution guidelines
1. **Add factions/detachments** under `factions["<FactionKey>"]` (`combatPatrols` or `detachments`) using consistent naming/casing.
2. **Add stratagems** as complete objects with explicit `when`, `target`, `effect`; use `""` for `restrictions` if none.
3. **Update grouping**: add new factions to the correct `factionGroups` entry so they appear under the right heading in the UI.
4. **Validate locally**: run `npm run dev` and test the affected faction/detachment; fix any console errors or rendering issues.
5. **Keep diffs clean**: 2-space indentation, stable key ordering, no trailing commas.
