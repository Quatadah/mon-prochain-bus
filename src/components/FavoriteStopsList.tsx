import { MapPin, Trash2 } from 'lucide-react'
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { ScrollArea } from "../components/ui/scroll-area"
import arretsLignes from '../data/arrets-lignes.json'
import referentielLignes from '../data/referentiel-des-lignes.json'
import { FavoriteStop, Stop } from '../types'
import { calculateDistance } from '../utils/geoUtils'

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
};

const typedArretsLignes = arretsLignes as Stop[]

const getRouteDescription = (stop: FavoriteStop) => {
  const stops = typedArretsLignes.filter(s => s.id === stop.id);
  if (stops.length > 1) {
    let maxDistance = 0;
    let station1 = stops[0];
    let station2 = stops[0];

    for (let i = 0; i < stops.length; i++) {
      for (let j = i + 1; j < stops.length; j++) {
        const distance = calculateDistance(
          parseFloat(stops[i].stop_lat),
          parseFloat(stops[i].stop_lon),
          parseFloat(stops[j].stop_lat),
          parseFloat(stops[j].stop_lon)
        );
        if (distance > maxDistance) {
          maxDistance = distance;
          station1 = stops[i];
          station2 = stops[j];
        }
      }
    }

    return { start: station1.stop_name, end: station2.stop_name };
  }
  return null;
};

const getLinePicto = (lineId: string) => {
  const id = lineId.split(':')[1];
  const lineData = referentielLignes.find(line => line.id_line === id);
  return lineData?.picto?.url;
};

export function FavoriteStopsList({ stops, onSelectStop, onRemoveStop, onSwitchTab }: FavoriteStopsListProps) {
  const handleSelectStop = (stop: FavoriteStop) => {
    onSelectStop(stop);
    onSwitchTab('passages');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-2xl font-semibold">Mes arrêts favoris</h2>
        <ScrollArea className="pr-4">
          <ul className="space-y-4">
            {stops.map((stop) => {
              const routeDescription = getRouteDescription(stop);
              return (
                <li key={stop.stop_id}>
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
                            stop.shortname
                          )}
                          <span className="text-lg font-medium">{stop.stop_name}</span>
                        </div>
                        <Badge>{modeMapping[stop.mode]}</Badge>
                      </div>
                      {routeDescription && (
                        <div className="flex items-center mb-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {routeDescription.start} - {routeDescription.end}
                        </div>
                      )}
                      <div className="mb-4 text-sm font-medium">
                        Direction : {stop.direction}
                      </div>
                      <div className="flex justify-between">
                        <Button onClick={() => handleSelectStop(stop)} variant="outline" size="sm">
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
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}