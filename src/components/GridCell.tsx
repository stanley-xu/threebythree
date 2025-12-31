import { useState, useRef, type ChangeEvent } from 'react'

interface GridCellProps {
  image: string | null
  onImageSet: (image: string) => void
  onImageClear: () => void
}

export function GridCell({ image, onImageSet, onImageClear }: GridCellProps) {
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageSet(urlInput.trim())
      setUrlInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === 'string') {
          onImageSet(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (image) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={image}
          alt="Grid cell"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onImageClear}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Remove image"
        >
          &times;
        </button>
      </div>
    )
  }

  return (
    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 gap-3">
      <div className="w-full flex flex-col gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste image URL..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Load URL
        </button>
      </div>

      <div className="w-full border-t border-gray-300 pt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
        >
          Upload Image
        </button>
      </div>
    </div>
  )
}
