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
  const [selectedStop, setSelectedStop] = useState<FavoriteStop | null>(() => {
    const saved = localStorage.getItem('selectedStop')
    return saved ? JSON.parse(saved) : null
  })
  const [activeTab, setActiveTab] = useState("passages")

  useEffect(() => {
    setFavoriteStops(getFavoriteStops())
  }, [])

  useEffect(() => {
    if (selectedStop) {
      localStorage.setItem('selectedStop', JSON.stringify(selectedStop))
    } else {
      localStorage.removeItem('selectedStop')
    }
  }, [selectedStop])

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
      <div className="flex flex-col items-center min-h-screen bg-background">
        <div className="w-full max-w-2xl">
          <header className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="Mon Prochain Bus" width={32} height={32} />
              <h1 className="text-xl font-bold">Mon Prochain Bus</h1>
            </div>
            <ThemeToggle />
          </header>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="passages">Passages</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="add">Ajouter</TabsTrigger>
            </TabsList>
            <TabsContent value="passages">
              {selectedStop ? (
                <NextPassages stop={selectedStop} />
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Aucun arrêt sélectionné. Veuillez choisir un arrêt dans la liste ou en ajouter un nouveau.
                  </p>
                  <button
                    onClick={() => setActiveTab("list")}
                    className="text-primary hover:underline"
                  >
                    Voir la liste des arrêts
                  </button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="list">
              {favoriteStops.length > 0 ? (
                <FavoriteStopsList
                  stops={favoriteStops}
                  onSelectStop={setSelectedStop}
                  onRemoveStop={handleRemoveFavoriteStop}
                  onSwitchTab={setActiveTab}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Vous n'avez aucun arrêt favori. Ajoutez-en un pour commencer !
                  </p>
                  <button
                    onClick={() => setActiveTab("add")}
                    className="text-primary hover:underline"
                  >
                    Ajouter un arrêt
                  </button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="add">
              <AddFavoriteStop onAdd={handleAddFavoriteStop} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  )
}