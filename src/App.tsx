import { Analytics } from "@vercel/analytics/react"
import { AnimatePresence, motion } from "framer-motion"
import { Bus, List, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AddFavoriteStop } from './components/AddFavoriteStop'
import { FavoriteStopsList } from './components/FavoriteStopsList'
import { NextPassages } from './components/NextPassages'
import { ThemeToggle } from './components/ThemeToggle'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { Button } from "./components/ui/button"
import { FavoriteStop } from './types'
import { getFavoriteStops, removeFavoriteStop, saveFavoriteStop } from './utils/storage'

function AppContent() {
  const [favoriteStops, setFavoriteStops] = useState<FavoriteStop[]>([])
  const [selectedStop, setSelectedStop] = useState<FavoriteStop | null>(() => {
    const saved = localStorage.getItem('selectedStop')
    return saved ? JSON.parse(saved) : null
  })
  const [activeTab, setActiveTab] = useState("passages")
  const { addToast } = useToast()

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
    setSelectedStop(favoriteStop)
    setActiveTab("passages")

    addToast({
      title: "Arrêt ajouté",
      description: `${stop.stop_name} a été ajouté à vos favoris`,
      variant: "success"
    })
  }

  const handleRemoveFavoriteStop = (stopId: string) => {
    const stop = favoriteStops.find(s => s.stop_id === stopId)
    removeFavoriteStop(stopId)
    setFavoriteStops(getFavoriteStops())
    if (selectedStop && selectedStop.stop_id === stopId) {
      setSelectedStop(null)
    }
    if (stop) {
      addToast({
        title: "Arrêt supprimé",
        description: `${stop.stop_name} a été retiré de vos favoris`,
        variant: "default"
      })
    }
  }

  const renderMobileContent = () => {
    switch (activeTab) {
      case "passages":
        return (
          <motion.div
            key="passages"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {selectedStop ? (
              <NextPassages stop={selectedStop} />
            ) : (
              <EmptyState
                icon={Bus}
                title="Aucun arrêt sélectionné"
                description="Sélectionnez un arrêt pour voir les prochains passages en temps réel."
                actionLabel="Choisir un arrêt"
                onAction={() => setActiveTab("list")}
              />
            )}
          </motion.div>
        )
      case "list":
        return (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {favoriteStops.length > 0 ? (
              <FavoriteStopsList
                stops={favoriteStops}
                onSelectStop={setSelectedStop}
                onRemoveStop={handleRemoveFavoriteStop}
                onSwitchTab={setActiveTab}
              />
            ) : (
              <EmptyState
                icon={List}
                title="Liste vide"
                description="Ajoutez vos arrêts favoris pour y accéder rapidement."
                actionLabel="Ajouter un arrêt"
                onAction={() => setActiveTab("add")}
              />
            )}
          </motion.div>
        )
      case "add":
        return (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <AddFavoriteStop onAdd={handleAddFavoriteStop} />
          </motion.div>
        )
      default:
        return null
    }
  }

  const renderDesktopContent = () => {
    if (activeTab === "add") {
      return (
        <motion.div
          key="add-desktop"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full p-6 overflow-y-auto"
        >
          <div className="max-w-2xl mx-auto">
            <AddFavoriteStop onAdd={handleAddFavoriteStop} />
          </div>
        </motion.div>
      )
    }

    // Default view (Passages)
    return (
      <motion.div
        key="passages-desktop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full p-6 overflow-y-auto"
      >
        {selectedStop ? (
          <div className="max-w-3xl mx-auto">
            <NextPassages stop={selectedStop} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={Bus}
              title="Sélectionnez un arrêt"
              description="Choisissez un arrêt dans la liste à gauche pour voir les prochains passages."
              actionLabel="Ajouter un nouvel arrêt"
              onAction={() => setActiveTab("add")}
            />
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 md:p-8 md:bg-muted/20">
      <div className="w-full max-w-md md:max-w-6xl flex flex-col h-screen md:h-[85vh] relative overflow-hidden bg-background/50 sm:border-x sm:border-border/50 md:border md:rounded-3xl shadow-2xl shadow-black/5 md:grid md:grid-cols-[320px_1fr] md:bg-background/80 md:backdrop-blur-xl">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col border-r border-border/50 bg-muted/10">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 text-white overflow-hidden">
                  <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-gradient">
                  Mon Bus
                </h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Paris & IDF</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 pb-0">
              <Button
                onClick={() => setActiveTab("add")}
                className="w-full justify-start gap-2"
                variant={activeTab === "add" ? "secondary" : "ghost"}
              >
                <Plus className="w-4 h-4" />
                Ajouter un arrêt
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FavoriteStopsList
                stops={favoriteStops}
                onSelectStop={(stop) => {
                  setSelectedStop(stop)
                  setActiveTab("passages")
                }}
                onRemoveStop={handleRemoveFavoriteStop}
                onSwitchTab={setActiveTab}
              />
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden absolute top-0 left-0 right-0 z-40 glass px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 text-white">
                  <Bus className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gradient">
                  Mon Bus
                </h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Paris & IDF</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pt-24 pb-24 px-4 scrollbar-hide md:pt-0 md:pb-0 md:px-0 relative">
          {/* Mobile Content */}
          <div className="md:hidden h-full">
            <AnimatePresence mode="wait">
              {renderMobileContent()}
            </AnimatePresence>
          </div>

          {/* Desktop Content */}
          <div className="hidden md:block h-full bg-background/50">
            <AnimatePresence mode="wait">
              {renderDesktopContent()}
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-6 left-4 right-4 z-40">
          <div className="glass-card rounded-2xl p-1.5 flex items-center justify-between relative">
            {["passages", "list", "add"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {tab === "passages" && <Bus className={`w-5 h-5 ${activeTab === tab ? "fill-current" : ""}`} />}
                  {tab === "list" && <List className={`w-5 h-5 ${activeTab === tab ? "stroke-[2.5px]" : ""}`} />}
                  {tab === "add" && <Plus className={`w-5 h-5 ${activeTab === tab ? "stroke-[2.5px]" : ""}`} />}
                  <span className="text-[10px] font-medium capitalize">
                    {tab === "passages" ? "Passages" : tab === "list" ? "Favoris" : "Ajouter"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: any) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
        <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 backdrop-blur-sm shadow-xl">
          <Icon className="w-12 h-12 text-primary/80" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gradient">{title}</h3>
      <p className="mb-8 text-muted-foreground max-w-xs leading-relaxed">
        {description}
      </p>
      <button
        onClick={onAction}
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
      >
        {actionLabel}
      </button>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Analytics />
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </>
  )
}