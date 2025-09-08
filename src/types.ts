export type PhaseKey = 'cmd' | 'mov' | 'shoo' | 'chg' | 'fgt'

export interface CardData {
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
