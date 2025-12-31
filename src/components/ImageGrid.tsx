import { useState } from 'react'
import { GridCell } from './GridCell'

export function ImageGrid() {
  const [images, setImages] = useState<(string | null)[]>(Array(9).fill(null))

  const handleImageSet = (index: number, image: string) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = image
      return next
    })
  }

  const handleImageClear = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {images.map((image, index) => (
          <GridCell
            key={index}
            image={image}
            onImageSet={(img) => handleImageSet(index, img)}
            onImageClear={() => handleImageClear(index)}
          />
        ))}
      </div>
    </div>
  )
}
