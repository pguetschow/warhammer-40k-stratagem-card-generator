export type EditionId = '10' | '11' | string
export type PhaseKey = 'command' | 'movement' | 'shooting' | 'charge' | 'fight'

export interface CardData {
    id?: string
    name: string
    cp: number
    type: string
    group: string
    timing: 'yourTurn' | 'oppTurn' | 'everyTurn' | string
    phases: PhaseKey[]
    when: string
    target: string
    effect: string
    restrictions: string
}

export interface FactionData {
    name: string;
    detachments: Record<string, CardData[]>
    combatPatrols: Record<string, CardData[]>
}

export interface EditionOption {
    id: EditionId
    label: string
    sourceUrl: string
}

export interface EditionData {
    edition: EditionId
    editionLabel: string
    sourceUrl: string
    lastUpdate: string
    factionGroups: Record<string, string[]>
    factions: Record<string, FactionData>
}
