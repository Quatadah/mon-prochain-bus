import { Bus, Home, Menu, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddFavoriteStop } from './components/AddFavoriteStop'
import { FavoriteStopsList } from './components/FavoriteStopsList'
import { NextPassages } from './components/NextPassages'
import { ThemeToggle } from './components/ThemeToggle'
import { Button } from "./components/ui/button"
import { ScrollArea } from "./components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { ThemeProvider } from './context/ThemeContext'
import { FavoriteStop } from './types'
import { getFavoriteStops, removeFavoriteStop, saveFavoriteStop } from './utils/storage'

export default function App() {
  const [favoriteStops, setFavoriteStops] = useState<FavoriteStop[]>([])
  const [selectedStop, setSelectedStop] = useState<FavoriteStop | null>(null)
  const [activeTab, setActiveTab] = useState("home")

  useEffect(() => {
    setFavoriteStops(getFavoriteStops())
  }, [])

  const handleAddFavoriteStop = (stop: FavoriteStop) => {
    const favoriteStop = { ...stop, stop_id: stop.stop_id };
    saveFavoriteStop(favoriteStop)
    setFavoriteStops(getFavoriteStops())
    setActiveTab("home")
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
      <div className="min-h-screen transition-colors duration-200 bg-background">
        <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between max-w-2xl p-4 mx-auto bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Bus className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Mon Prochain Bus</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  <Button variant="ghost" onClick={() => setActiveTab("home")}>
                    <Home className="w-5 h-5 mr-2" />
                    Accueil
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveTab("add")}>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Ajouter un arrêt
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="container max-w-2xl pt-20 pb-8 mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="hidden md:inline-flex">
              <TabsTrigger value="home">
                <Home className="w-5 h-5 mr-2" />
                Accueil
              </TabsTrigger>
              <TabsTrigger value="add">
                <PlusCircle className="w-5 h-5 mr-2" />
                Ajouter un arrêt
              </TabsTrigger>
            </TabsList>
            <TabsContent value="home" className="space-y-4">
              <ScrollArea>
                <FavoriteStopsList 
                  stops={favoriteStops} 
                      onSelectStop={setSelectedStop}
                      onRemoveStop={handleRemoveFavoriteStop}
                    />
                </ScrollArea>
                {selectedStop && (
                  <NextPassages stop={selectedStop} />
                )}
            </TabsContent>
            <TabsContent value="add">
              <AddFavoriteStop onAdd={handleAddFavoriteStop} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}