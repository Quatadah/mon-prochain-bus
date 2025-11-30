'use client'

import { AnimatePresence, motion } from "framer-motion"
import { MapPin, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import terminus from '../data/terminus.json'
import { FavoriteStop } from '../types'
import { getLinePicto } from '../utils/lines'

interface FavoriteStopsListProps {
  stops: FavoriteStop[]
  onSelectStop: (stop: FavoriteStop) => void
  onRemoveStop: (stopId: string) => void
  onSwitchTab: (tab: string) => void
}

const modeMapping: Record<string, string> = {
  'Metro': 'Métro',
  'Bus': 'Bus',
  'RapidTransit': 'RER',
  'regionalTrain': 'Transilien',
  'LocalTrain': 'RER',
  'Tramway': 'Tram'
}

type TerminusType = {
  [key: string]: { start: string; end: string; }
};

export function FavoriteStopsList({ stops, onSelectStop, onRemoveStop, onSwitchTab }: FavoriteStopsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stopToDelete, setStopToDelete] = useState<FavoriteStop | null>(null)

  const handleSelectStop = (stop: FavoriteStop) => {
    onSelectStop(stop)
    onSwitchTab('passages')
  }

  const handleDeleteClick = (e: React.MouseEvent, stop: FavoriteStop) => {
    e.stopPropagation()
    setStopToDelete(stop)
  }

  const handleConfirmDelete = () => {
    if (stopToDelete) {
      onRemoveStop(stopToDelete.stop_id)
      setStopToDelete(null)
    }
  }

  const memoizedStops = useMemo(() => stops.map((stop) => {
    const terminusInfo = (terminus as TerminusType)[stop.id]
    return { ...stop, routeDescription: terminusInfo }
  }), [stops])

  const filteredStops = useMemo(() => {
    if (!searchQuery.trim()) return memoizedStops
    const query = searchQuery.toLowerCase()
    return memoizedStops.filter(stop =>
      stop.stop_name.toLowerCase().includes(query) ||
      stop.shortname.toLowerCase().includes(query) ||
      stop.route_long_name.toLowerCase().includes(query) ||
      (stop.routeDescription && (
        stop.routeDescription.start.toLowerCase().includes(query) ||
        stop.routeDescription.end.toLowerCase().includes(query)
      ))
    )
  }, [memoizedStops, searchQuery])

  return (
    <>
      <div className="space-y-4 h-full flex flex-col">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Mes favoris</h2>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Rechercher un arrêt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all shadow-sm"
                aria-label="Rechercher un arrêt"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground px-1">
              {filteredStops.length} arrêt{filteredStops.length > 1 ? 's' : ''} trouvé{filteredStops.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4 h-full">
          {filteredStops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                {searchQuery ? "Aucun arrêt ne correspond à votre recherche" : "Aucun arrêt favori"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                  Ajoutez des arrêts pour les retrouver ici.
                </p>
              )}
            </div>
          ) : (
            <ul className="space-y-3 pb-20 md:pb-4">
              <AnimatePresence mode="popLayout">
                {filteredStops.map((stop, index) => (
                  <FavoriteStopItem
                    key={stop.stop_id}
                    stop={stop}
                    index={index}
                    onSelectStop={handleSelectStop}
                    onRemoveStop={handleDeleteClick}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </ScrollArea>
      </div>

      <Dialog open={!!stopToDelete} onOpenChange={() => setStopToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] glass-card border-none">
          <DialogHeader>
            <DialogTitle>Supprimer l'arrêt favori ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{stopToDelete?.stop_name}</strong> de vos favoris ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setStopToDelete(null)} className="rounded-xl">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="rounded-xl">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface FavoriteStopItemProps {
  stop: FavoriteStop & { routeDescription: { start: string; end: string; } | undefined }
  index: number
  onSelectStop: (stop: FavoriteStop) => void
  onRemoveStop: (e: React.MouseEvent, stop: FavoriteStop) => void
}

function FavoriteStopItem({ stop, index, onSelectStop, onRemoveStop }: FavoriteStopItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        className="group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer bg-card/50 hover:bg-card"
        onClick={() => onSelectStop(stop)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-500" />

        <CardContent className="p-4 relative">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              {getLinePicto(stop.id) ? (
                <div className={`w-10 h-10 flex items-center justify-center ${stop.mode === 'Tramway' ? 'bg-white rounded-lg p-0.5' : ''}`}>
                  <img
                    src={getLinePicto(stop.id)}
                    alt={stop.shortname}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-primary-foreground font-bold text-sm">
                    {stop.shortname}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base pr-8 leading-tight">{stop.stop_name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => onRemoveStop(e, stop)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium bg-muted/50 flex-shrink-0">
                  {modeMapping[stop.mode]}
                </Badge>
                <span className="text-xs text-muted-foreground break-words leading-tight">
                  Dir. {stop.direction}
                </span>
              </div>

              {stop.routeDescription && (
                <div className="flex items-start text-xs text-muted-foreground/80 pt-1">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="break-words leading-tight">{stop.routeDescription.start} - {stop.routeDescription.end}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.li>
  )
}