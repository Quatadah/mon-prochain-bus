'use client'

import { MapPin, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
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
  const handleSelectStop = (stop: FavoriteStop) => {
    onSelectStop(stop)
    onSwitchTab('passages')
  }

  const memoizedStops = useMemo(() => stops.map((stop) => {
    const terminusInfo = (terminus as TerminusType)[stop.id]
    return { ...stop, routeDescription: terminusInfo }
  }), [stops])

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-2xl font-semibold">Mes arrêts favoris</h2>
        <ScrollArea className="h-[500px] pr-4">
          <ul className="space-y-4">
            {memoizedStops.map((stop) => (
              <FavoriteStopItem
                key={stop.stop_id}
                stop={stop}
                onSelectStop={handleSelectStop}
                onRemoveStop={onRemoveStop}
              />
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface FavoriteStopItemProps {
  stop: FavoriteStop & { routeDescription: { start: string; end: string; } | undefined }
  onSelectStop: (stop: FavoriteStop) => void
  onRemoveStop: (stopId: string) => void
}

function FavoriteStopItem({ stop, onSelectStop, onRemoveStop }: FavoriteStopItemProps) {
  return (
    <li>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getLinePicto(stop.id) ? (
                <img
                  src={getLinePicto(stop.id)}
                  alt={stop.shortname}
                  className="w-6 h-6"
                />
              ) : (
                <span className="px-2 bg-sky-400 font-bold rounded">{stop.shortname}</span>
              )}
              <span className="text-lg font-medium">{stop.stop_name}</span>
            </div>
            <Badge>{modeMapping[stop.mode]}</Badge>
          </div>
          {stop.routeDescription && (
            <div className="flex items-center mb-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {stop.routeDescription.start} - {stop.routeDescription.end}
            </div>
          )}
          <div className="mb-4 text-sm font-medium">
            Direction : {stop.direction}
          </div>
          <div className="flex justify-between">
            <Button onClick={() => onSelectStop(stop)} variant="outline" size="sm">
              Voir les passages
            </Button>
            <Button onClick={() => onRemoveStop(stop.stop_id)} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}