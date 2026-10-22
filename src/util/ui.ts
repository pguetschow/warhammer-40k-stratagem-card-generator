// Tailwind classes shared by the selection controls and the print preview.

// Black like a card's title band, with the same cut corner.
export const primaryButtonClass = 'inline-flex h-11 clip-corner items-center bg-band px-6 font-heavy text-[14px] ' +
    'tracking-[0.04em] text-slip uppercase [--clip:12px] hover:bg-teal ' +
    'focus-visible:shadow-[inset_0_0_0_3px_var(--color-slip)] focus-visible:outline-none ' +
    'disabled:cursor-not-allowed disabled:bg-ink/40'

export const linkButtonClass = 'font-semibold text-teal underline decoration-teal/40 decoration-2 ' +
    'underline-offset-4 hover:decoration-teal focus-visible:outline-3 focus-visible:outline-offset-2 ' +
    'focus-visible:outline-teal'
