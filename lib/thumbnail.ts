// Browser-only: Canvas API thumbnail generation

export async function generateThumbnail(file: File, maxSize = 200): Promise<Blob | null> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1)
        const w = Math.max(1, Math.round(img.naturalWidth * scale))
        const h = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(url); resolve(null); return }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          resolve(blob)
        }, 'image/jpeg', 0.82)
      } catch {
        URL.revokeObjectURL(url)
        resolve(null)
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}
