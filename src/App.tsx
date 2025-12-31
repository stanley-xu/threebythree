import { ImageGrid } from './components/ImageGrid'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center py-8 transition-colors">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">3x3 Image Grid</h1>
        <ImageGrid />
      </div>
    </ThemeProvider>
  )
}

export default App
