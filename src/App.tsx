import { ImageGrid } from './components/ImageGrid'

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">3x3 Image Grid</h1>
      <ImageGrid />
    </div>
  )
}

export default App
