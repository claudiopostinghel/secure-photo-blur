import type { LoadedImage } from '../types'

/** iOS Safari canvas pixel limit (16.7 MP) */
const IOS_CANVAS_LIMIT = 16_700_000

/** Detect HEIC/HEIF by magic bytes or file extension */
function isHeic(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'heic' || ext === 'heif') return true
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  return false
}

async function convertHeic(file: File): Promise<Blob> {
  // Lazy-load heic2any only when needed
  const { default: heic2any } = await import('heic2any')
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(result) ? result[0] : result
}

export async function loadImage(file: File): Promise<LoadedImage> {
  let blob: Blob = file

  if (isHeic(file)) {
    blob = await convertHeic(file)
  }

  const url = URL.createObjectURL(blob)
  let bitmap: ImageBitmap

  try {
    bitmap = await createImageBitmap(blob)
  } finally {
    URL.revokeObjectURL(url)
  }

  const originalWidth = bitmap.width
  const originalHeight = bitmap.height
  const pixels = originalWidth * originalHeight

  let displayWidth = originalWidth
  let displayHeight = originalHeight
  let scale = 1

  // Downscale for iOS canvas limit
  if (pixels > IOS_CANVAS_LIMIT) {
    scale = Math.sqrt(IOS_CANVAS_LIMIT / pixels)
    displayWidth = Math.floor(originalWidth * scale)
    displayHeight = Math.floor(originalHeight * scale)
  }

  return {
    bitmap,
    originalWidth,
    originalHeight,
    displayWidth,
    displayHeight,
    scale,
    fileName: file.name,
    mimeType: file.type || 'image/jpeg',
  }
}
