import { ImageGrid } from './components/ImageGrid'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-all duration-300">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
            Build your 3x3
          </h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex flex-col items-center px-4 pb-8">
          <ImageGrid />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
