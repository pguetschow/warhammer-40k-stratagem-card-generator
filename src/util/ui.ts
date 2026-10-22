// Tailwind classes shared by the app's buttons (the selection controls and the print preview).
const buttonBaseClass = 'inline-flex flex-1 items-center justify-center gap-2 px-5 py-2.5 font-label text-sm ' +
    'font-bold tracking-[0.14em] whitespace-nowrap uppercase transition disabled:cursor-not-allowed ' +
    'disabled:opacity-40 sm:flex-none'
export const primaryButtonClass = `${buttonBaseClass} chamfer bg-linear-to-b from-gold-300 to-gold-500 text-iron-950 ` +
    'hover:from-gold-200 hover:to-gold-400 focus-visible:ring-2 focus-visible:ring-iron-950/60 focus-visible:ring-inset'
export const secondaryButtonClass = `${buttonBaseClass} border border-iron-600 text-bone-300 hover:border-gold-500/60 ` +
    'hover:text-gold-200 disabled:hover:border-iron-600 disabled:hover:text-bone-300'
