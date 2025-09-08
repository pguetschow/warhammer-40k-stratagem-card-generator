import {HEX_ALWAYS, HEX_ENEMY, HEX_MINE, META} from './constants'
import type {CardData} from '../types'

export function stripColorFor(card: CardData) {
    const t = (card.timing || 'everyTurn')
    return t === 'yourTurn' ? HEX_MINE : t === 'oppTurn' ? HEX_ENEMY : HEX_ALWAYS
}

export function metaColorFor(card: CardData) {
    const g = (card.group || '').toUpperCase()
    if (g.startsWith('NECRONS')) return META.NECRONS
    if (g.startsWith('TYRANIDS')) return META.TYRANIDS
    if (g.startsWith('IMPERIAL AGENTS')) return META.IMPERIAL_AGENTS
    if (g.startsWith('ASTRA MILITARUM')) return META.ASTRA_MILITARUM
    if (g.startsWith('GENESTEALER CULTS')) return META.GENESTEALER_CULTS
    if (g.startsWith('AELDARI')) return META.AELDARI
    if (g.startsWith('ADEPTUS TITANICUS')) return META.ADEPTUS_TITANICUS
    if (g.startsWith('ORKS')) return META.ORKS
    if (g.startsWith('UNALIGNED FORCES')) return META.UNALIGNED_FORCES
    if (g.startsWith('GREY KNIGHTS')) return META.GREY_KNIGHTS
    if (g.startsWith("T’AU") || g.startsWith("TAU")) return META.TAU_EMPIRE
    if (g.startsWith('LEAGUES OF VOTANN')) return META.LEAGUES_OF_VOTANN
    if (g.startsWith('ADEPTUS MECHANICUS')) return META.ADEPTUS_MECHANICUS
    if (g.startsWith('THOUSAND SONS')) return META.THOUSAND_SONS
    if (g.startsWith('DEATH GUARD')) return META.DEATH_GUARD
    if (g.startsWith("EMPEROR’S CHILDREN")) return META.EMPERORS_CHILDREN
    if (g.startsWith('WORLD EATERS')) return META.WORLD_EATERS
    if (g.startsWith('CHAOS KNIGHTS')) return META.CHAOS_KNIGHTS
    if (g.startsWith('CHAOS DAEMONS')) return META.CHAOS_DAEMONS
    if (g.startsWith('IMPERIAL KNIGHTS')) return META.IMPERIAL_KNIGHTS
    if (g.startsWith('SPACE MARINES')) return META.SPACE_MARINES
    if (g.startsWith('ADEPTUS CUSTODES')) return META.ADEPTUS_CUSTODES
    if (g.startsWith('ADEPTA SORORITAS') || g.startsWith('SISTERS OF BATTLE')) return META.ADEPTA_SORORITAS
    if (g.startsWith('CHAOS SPACE MARINES')) return META.CHAOS_SPACE_MARINES
    if (g.startsWith('DRUKHARI')) return META.DRUKHARI
    return META.CORE
}