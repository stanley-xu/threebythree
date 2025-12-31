import { useState, useRef, useEffect, type ChangeEvent } from 'react'

interface Position {
  x: number
  y: number
}

interface GridCellProps {
  image: string | null
  position: Position
  zoom: number
  onImageSet: (image: string) => void
  onImageClear: () => void
  onPositionChange: (position: Position) => void
  onZoomChange: (zoom: number) => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.1

function getDistance(touch1: { clientX: number; clientY: number }, touch2: { clientX: number; clientY: number }): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

export function GridCell({
  image,
  position,
  zoom,
  onImageSet,
  onImageClear,
  onPositionChange,
  onZoomChange,
}: GridCellProps) {
  const [urlInput, setUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isPinching, setIsPinching] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [pinchStartDistance, setPinchStartDistance] = useState(0)
  const [pinchStartZoom, setPinchStartZoom] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isPinching) return
    onPositionChange({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setIsPinching(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()

    if (e.touches.length === 2) {
      // Pinch start
      const distance = getDistance(e.touches[0], e.touches[1])
      setPinchStartDistance(distance)
      setPinchStartZoom(zoom)
      setIsPinching(true)
      setIsDragging(false)
    } else if (e.touches.length === 1) {
      // Single touch drag
      const touch = e.touches[0]
      handleDragStart(touch.clientX, touch.clientY)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta))
    onZoomChange(newZoom)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP)
    onZoomChange(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP)
    onZoomChange(newZoom)
  }

  useEffect(() => {
    if (!isDragging && !isPinching) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 2 && isPinching) {
        // Pinch zoom
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / pinchStartDistance
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * scale))
        onZoomChange(newZoom)
      } else if (e.touches.length === 1 && isDragging && !isPinching) {
        // Single touch drag
        const touch = e.touches[0]
        handleDragMove(touch.clientX, touch.clientY)
      }
    }

    const handleMouseUp = () => handleDragEnd()
    const handleTouchEnd = () => handleDragEnd()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, isPinching, dragStart, pinchStartDistance, pinchStartZoom, zoom])

  if (image) {
    return (
      <div
        ref={containerRef}
        className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group"
        onWheel={handleWheel}
      >
        <img
          src={image}
          alt="Grid cell"
          className="w-full h-full object-cover select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          draggable={false}
        />
        <button
          onClick={onImageClear}
          className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          aria-label="Remove image"
        >
          &times;
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="bg-black/70 hover:bg-black/90 disabled:bg-black/40 text-white rounded w-6 h-6 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-sm font-bold"
            aria-label="Zoom out"
          >
            -
          </button>
          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="bg-black/70 hover:bg-black/90 disabled:bg-black/40 text-white rounded w-6 h-6 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-sm font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
          Scroll to zoom
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-3 sm:p-4 gap-2 sm:gap-3">
      <div className="w-full flex flex-col gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste image URL..."
          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim()}
          className="w-full px-2 sm:px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Load URL
        </button>
      </div>

      <div className="w-full border-t border-gray-300 dark:border-gray-600 pt-2 sm:pt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="w-full px-2 sm:px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer"
        >
          Upload Image
        </button>
      </div>
    </div>
  )
}
