import { Bus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddFavoriteStop } from './components/AddFavoriteStop'
import { FavoriteStopsList } from './components/FavoriteStopsList'
import { NextPassages } from './components/NextPassages'
import { ThemeToggle } from './components/ThemeToggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { ThemeProvider } from './context/ThemeContext'
import { FavoriteStop } from './types'
import { getFavoriteStops, removeFavoriteStop, saveFavoriteStop } from './utils/storage'

export default function App() {
  const [favoriteStops, setFavoriteStops] = useState<FavoriteStop[]>([])
  const [selectedStop, setSelectedStop] = useState<FavoriteStop | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    setFavoriteStops(getFavoriteStops())
  }, [])

  const handleAddFavoriteStop = (stop: FavoriteStop) => {
    const favoriteStop = { ...stop, stop_id: stop.stop_id };
    saveFavoriteStop(favoriteStop)
    setFavoriteStops(getFavoriteStops())
    setActiveTab("list")
  }

  const handleRemoveFavoriteStop = (stopId: string) => {
    removeFavoriteStop(stopId)
    setFavoriteStops(getFavoriteStops())
    if (selectedStop && selectedStop.stop_id === stopId) {
      setSelectedStop(null)
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Bus className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-bold">Mon Prochain Bus</h1>
          </div>
          <ThemeToggle />
        </header>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="add">Ajouter</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <FavoriteStopsList 
              stops={favoriteStops} 
              onSelectStop={setSelectedStop}
              onRemoveStop={handleRemoveFavoriteStop}
            />
            {selectedStop && (
              <div className="mt-4">
                <NextPassages stop={selectedStop} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="add">
            <AddFavoriteStop onAdd={handleAddFavoriteStop} />
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  )
}