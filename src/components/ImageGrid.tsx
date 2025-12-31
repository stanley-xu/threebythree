import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { GridCell } from './GridCell'

interface Position {
  x: number
  y: number
}

const defaultPosition = (): Position => ({ x: 0, y: 0 })

export function ImageGrid() {
  const [images, setImages] = useState<(string | null)[]>(Array(9).fill(null))
  const [positions, setPositions] = useState<Position[]>(
    Array(9).fill(null).map(() => defaultPosition())
  )
  const gridRef = useRef<HTMLDivElement>(null)

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
  }

  const handlePositionChange = (index: number, position: Position) => {
    setPositions((prev) => {
      const next = [...prev]
      next[index] = position
      return next
    })
  }

  const handleSave = async () => {
    if (!gridRef.current) return

    const canvas = await html2canvas(gridRef.current, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f3f4f6',
    })

    const link = document.createElement('a')
    link.download = 'image-grid.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const hasAnyImage = images.some((img) => img !== null)

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div ref={gridRef} className="grid grid-cols-3 gap-2 sm:gap-4">
        {images.map((image, index) => (
          <GridCell
            key={index}
            image={image}
            position={positions[index]}
            onImageSet={(img) => handleImageSet(index, img)}
            onImageClear={() => handleImageClear(index)}
            onPositionChange={(pos) => handlePositionChange(index, pos)}
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
