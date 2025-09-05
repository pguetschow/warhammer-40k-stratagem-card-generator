import {HEX_ALWAYS, HEX_ENEMY, HEX_MINE, META} from './constants'
import type {CardData} from '../types'

export function stripColorFor(card: CardData) {
    const t = (card.timing || 'everyTurn')
    return t === 'ownTurn' ? HEX_MINE : t === 'enemyTurn' ? HEX_ENEMY : HEX_ALWAYS
}

export function metaColorFor(card: CardData) {
    const g = (card.group || '').toUpperCase()
    if (g.startsWith('NECRONS')) return META.NECRONS
    if (g.startsWith('TYRANIDS')) return META.TYRANIDS
    return META.CORE
}
