export type EditionId = '10' | '11' | string
export type PhaseKey = 'command' | 'movement' | 'shooting' | 'charge' | 'fight' | 'any'

export interface CardMode {
    name: string
    effect: string
    cpModifier?: number
}

export interface CardSection {
    label: string
    html: string
}

export interface CardData {
    id?: string
    name: string
    ref?: string
    flavor?: string
    cp: number
    /** Reference rules (e.g. Snap Shooting) aren't purchasable and show no CP badge. */
    noCp?: boolean
    type: string
    group: string
    timing: 'yourTurn' | 'oppTurn' | 'everyTurn' | string
    phases: PhaseKey[]
    when: string
    target: string
    effect: string
    restrictions: string
    modes?: CardMode[]
    /** Overrides the default WHEN/TARGET/EFFECT/RESTRICTIONS layout with custom labeled sections. */
    sections?: CardSection[]
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
