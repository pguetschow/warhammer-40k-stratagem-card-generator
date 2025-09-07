import { ref, type Ref } from 'vue'

type PendingAction = 'print' | 'download' | null

export function useBackgroundPdf(getPayload: () => any, opts?: {
  filename?: () => string
  clientFallback?: () => Promise<Blob> // required here (client-side)
}) {
  const isGenerating = ref(false)
  const error = ref<Error | null>(null)
  const pdfUrl: Ref<string | null> = ref(null)
  const pending: Ref<PendingAction> = ref(null)

  function revoke() {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = null
  }

  async function generate() {
    isGenerating.value = true
    error.value = null
    try {
      let blob: Blob | null = null
      if (opts?.clientFallback) {
        blob = await opts.clientFallback()
      }
      if (!blob) throw new Error('Clientseitige PDF-Erzeugung ist nicht konfiguriert')
      revoke()
      pdfUrl.value = URL.createObjectURL(blob)
      if (pending.value === 'print') printPdf()
      if (pending.value === 'download') downloadPdf()
    } catch (e: any) {
      console.error('[PDF] Generierung fehlgeschlagen:', e)
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isGenerating.value = false
      pending.value = null
    }
  }

  function ensureAnd(action: Exclude<PendingAction, null>) {
    if (pdfUrl.value) {
      action === 'print' ? printPdf() : downloadPdf()
    } else {
      pending.value = action
      generate()
    }
  }

  function printPdf() {
    if (!pdfUrl.value) return
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.src = pdfUrl.value
    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => iframe.remove(), 1500)
    }
    document.body.appendChild(iframe)
  }

  function downloadPdf() {
    if (!pdfUrl.value) return
    const a = document.createElement('a')
    a.href = pdfUrl.value
    a.download = opts?.filename?.() ?? 'dokument.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  function invalidate() {
    revoke()
  }

  return {
    isGenerating,
    error,
    pdfUrl,
    invalidate,
    generate,
    print: () => ensureAnd('print'),
    download: () => ensureAnd('download'),
  }
}
