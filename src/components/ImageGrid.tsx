import { useState, useCallback } from 'react'
import { GridCell } from './GridCell'

interface Position {
  x: number
  y: number
}

const DEFAULT_ZOOM = 1
const defaultPosition = (): Position => ({ x: 0, y: 0 })

export function ImageGrid() {
  const [images, setImages] = useState<(string | null)[]>(Array(9).fill(null))
  const [positions, setPositions] = useState<Position[]>(
    Array(9).fill(null).map(() => defaultPosition())
  )
  const [zooms, setZooms] = useState<number[]>(Array(9).fill(DEFAULT_ZOOM))

  const handleImageSet = (index: number, image: string) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = image
      return next
    })
    setPositions((prev) => {
      const next = [...prev]
      next[index] = defaultPosition()
      return next
    })
    setZooms((prev) => {
      const next = [...prev]
      next[index] = DEFAULT_ZOOM
      return next
    })
  }

  const handleImageClear = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
    setPositions((prev) => {
      const next = [...prev]
      next[index] = defaultPosition()
      return next
    })
    setZooms((prev) => {
      const next = [...prev]
      next[index] = DEFAULT_ZOOM
      return next
    })
  }

  const handlePositionChange = (index: number, position: Position) => {
    setPositions((prev) => {
      const next = [...prev]
      next[index] = position
      return next
    })
  }

  const handleZoomChange = (index: number, zoom: number) => {
    setZooms((prev) => {
      const next = [...prev]
      next[index] = zoom
      return next
    })
  }

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }, [])

  const handleSave = async () => {
    const cellSize = 300
    const gap = 8
    const canvasSize = cellSize * 3 + gap * 2

    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#1f2937' : '#f3f4f6'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3)
      const col = i % 3
      const x = col * (cellSize + gap)
      const y = row * (cellSize + gap)

      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb'
      ctx.fillRect(x, y, cellSize, cellSize)

      const imageSrc = images[i]
      if (imageSrc) {
        try {
          const img = await loadImage(imageSrc)
          const pos = positions[i]
          const zoom = zooms[i]

          ctx.save()
          ctx.beginPath()
          ctx.rect(x, y, cellSize, cellSize)
          ctx.clip()

          const scale = Math.max(cellSize / img.width, cellSize / img.height) * zoom
          const drawWidth = img.width * scale
          const drawHeight = img.height * scale
          const drawX = x + (cellSize - drawWidth) / 2 + pos.x
          const drawY = y + (cellSize - drawHeight) / 2 + pos.y

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
          ctx.restore()
        } catch {
          ctx.fillStyle = isDark ? '#374151' : '#d1d5db'
          ctx.fillRect(x, y, cellSize, cellSize)
        }
      }
    }

    const link = document.createElement('a')
    link.download = 'image-grid.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const hasAnyImage = images.some((img) => img !== null)

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {images.map((image, index) => (
          <GridCell
            key={index}
            image={image}
            position={positions[index]}
            zoom={zooms[index]}
            onImageSet={(img) => handleImageSet(index, img)}
            onImageClear={() => handleImageClear(index)}
            onPositionChange={(pos) => handlePositionChange(index, pos)}
            onZoomChange={(z) => handleZoomChange(index, z)}
          />
        ))}
      </div>
      {hasAnyImage && (
        <button
          onClick={handleSave}
          className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium"
        >
          Save Image
        </button>
      )}
    </div>
  )
}
