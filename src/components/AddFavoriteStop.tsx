import { Bus, Check, ChevronsUpDown, Train, TramFront } from "lucide-react"
import React, { useMemo, useState } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command"
import { Label } from "../components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import arretsLignes from '../data/arrets-lignes.json'
import referentielLignes from '../data/referentiel-des-lignes.json'
import { cn } from "../lib/utils"
import { FavoriteStop, Line, Stop, TransportMode } from '../types'
import { calculateDistance } from '../utils/geoUtils'

const transportModes: TransportMode[] = ['Metro', 'Bus', 'RapidTransit', 'regionalRail', 'LocalTrain', 'Tramway'];

const modeMapping: Record<TransportMode, string> = {
  'Metro': 'Métro',
  'Bus': 'Bus',
  'RapidTransit': 'RER',
  'LocalTrain': 'Transilien',
  'regionalRail': 'Régional',
  'Tramway': 'Tram'
};

const modeIcons: Record<TransportMode, React.ReactNode> = {
  'Metro': <TramFront className="w-4 h-4 mr-2" />,
  'Bus': <Bus className="w-4 h-4 mr-2" />,
  'RapidTransit': <Train className="w-4 h-4 mr-2" />,
  'LocalTrain': <Train className="w-4 h-4 mr-2" />,
  'regionalRail': <Train className="w-4 h-4 mr-2" />,
  'Tramway': <Train className="w-4 h-4 mr-2" />,
};

const typedArretsLignes = arretsLignes as Stop[]

const extractLineId = (fullId: string) => {
  return fullId.split(':')[1];
}

export function AddFavoriteStop({ onAdd }: { onAdd: (stop: FavoriteStop) => void }) {
  const [transportMode, setTransportMode] = useState<TransportMode | ''>('')
  const [line, setLine] = useState('')
  const [stop, setStop] = useState('')
  const [direction, setDirection] = useState('')
  const [modeOpen, setModeOpen] = useState(false)
  const [lineOpen, setLineOpen] = useState(false)
  const [stopOpen, setStopOpen] = useState(false)
  const [directionOpen, setDirectionOpen] = useState(false)

  const lines = useMemo(() => {
    if (!transportMode) return [];

    const uniqueLines = new Map<string, Line>();
    typedArretsLignes.forEach((stop: Stop) => {
      const key = `${stop.mode}-${stop.route_long_name}`;
      if (stop.mode === transportMode && !uniqueLines.has(key)) {
        uniqueLines.set(stop.id, {
          id: stop.id,
          route_long_name: stop.route_long_name,
          shortname: stop.shortname,
          mode: stop.mode,
          operatorname: stop.operatorname
        });
      }
    });

    return Array.from(uniqueLines.values());
  }, [transportMode]);

  const filteredStops = useMemo(() => {
    if (!transportMode || !line) return [];

    const uniqueStops = new Map();
    typedArretsLignes
      .filter((s: Stop) => s.mode === transportMode && s.id === line)
      .forEach((s: Stop) => {
        if (!uniqueStops.has(s.stop_name)) {
          uniqueStops.set(s.stop_name, s);
        }
      });

    return Array.from(uniqueStops.values());
  }, [transportMode, line]);

  const getRouteDescription = (line: Line) => {
    const stops = typedArretsLignes.filter(s => s.id === line.id);
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

  const selectedLineTermini = useMemo(() => {
    if (!line) return null;
    const selectedLine = lines.find(l => l.id === line);
    return selectedLine ? getRouteDescription(selectedLine) : null;
  }, [line, lines]);

  const getLinePicto = (lineId: string) => {
    const id = extractLineId(lineId);
    const lineData = referentielLignes.find(line => line.id_line === id);
    return lineData?.picto?.url;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedStop = filteredStops.find((s: Stop) => s.stop_id === stop);
    if (selectedStop && direction) {
      onAdd({ ...selectedStop, direction } as FavoriteStop)
      setTransportMode('')
      setLine('')
      setStop('')
      setDirection('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un arrêt favori</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="transport-mode" className="min-w-32">Mode de transport</Label>
            <Popover open={modeOpen} onOpenChange={setModeOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="transport-mode"
                  variant="outline"
                  role="combobox"
                  aria-expanded={modeOpen}
                  className="justify-between w-full"
                >
                  {transportMode ? (
                    <>
                      {modeIcons[transportMode as TransportMode]}
                      {modeMapping[transportMode as TransportMode]}
                    </>
                  ) : (
                    "Sélectionnez un mode de transport"
                  )}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un mode..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Aucun mode trouvé.</CommandEmpty>
                    <CommandGroup>
                      {transportModes.map((mode) => (
                        <CommandItem
                          key={mode}
                          value={modeMapping[mode]}
                          onSelect={() => {
                            setTransportMode(mode as TransportMode)
                            setModeOpen(false)
                          }}
                        >
                          <div className="flex items-center">
                            {modeIcons[mode as TransportMode]}
                            {modeMapping[mode]}
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              transportMode === mode ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {transportMode && (
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="line" className="min-w-32">Ligne</Label>
              <Popover open={lineOpen} onOpenChange={setLineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="line"
                    variant="outline"
                    role="combobox"
                    aria-expanded={lineOpen}
                    className="justify-between w-full"
                  >
                    {line ? (
                      <div className="flex items-center">
                        {getLinePicto(line) ? (
                          <img
                            src={getLinePicto(line)}
                            alt={lines.find(l => l.id === line)?.shortname}
                            className="h-6 w-6 mr-2"
                          />
                        ) : (
                          <span className="px-2 py-1 rounded bg-primary text-primary-foreground mr-2">
                            {lines.find(l => l.id === line)?.shortname}
                          </span>
                        )}
                      </div>
                    ) : "Sélectionnez une ligne"}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher une ligne..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>Aucune ligne trouvée.</CommandEmpty>
                      <CommandGroup>
                        {lines.map((l) => {
                          const routeDescription = getRouteDescription(l);
                          return (
                            <CommandItem
                              key={l.id}
                              value={`${l.shortname} ${l.route_long_name} ${l.operatorname}`}
                              onSelect={() => {
                                setLine(l.id)
                                setLineOpen(false)
                              }}
                            >
                              <div className="flex items-center">
                                {getLinePicto(l.id) ? (
                                  <img
                                    src={getLinePicto(l.id)}
                                    alt={l.shortname}
                                    className="h-6 w-6 mr-2"
                                  />
                                ) : (
                                  <span className="px-2 py-1 rounded bg-primary text-primary-foreground">
                                    {l.shortname}
                                  </span>
                                )}
                                {routeDescription && (
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    {routeDescription.start} - {routeDescription.end}
                                  </span>
                                )}
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  line === l.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {transportMode && line && (
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="stop" className="min-w-32">Arrêt</Label>
              <Popover open={stopOpen} onOpenChange={setStopOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="stop"
                    variant="outline"
                    role="combobox"
                    aria-expanded={stopOpen}
                    className="justify-between w-full"
                  >
                    {stop ? filteredStops.find(s => s.stop_id === stop)?.stop_name : "Sélectionnez un arrêt"}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un arrêt..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>Aucun arrêt trouvé.</CommandEmpty>
                      <CommandGroup>
                        {filteredStops.map((s) => (
                          <CommandItem
                            key={s.stop_id}
                            value={s.stop_name}
                            onSelect={() => {
                              setStop(s.stop_id)
                              setStopOpen(false)
                            }}
                          >
                            {s.stop_name}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                stop === s.stop_id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {selectedLineTermini && (
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="direction" className="min-w-32">Direction</Label>
              <Popover open={directionOpen} onOpenChange={setDirectionOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="direction"
                    variant="outline"
                    role="combobox"
                    aria-expanded={directionOpen}
                    className="justify-between w-full"
                  >
                    {direction ? `Direction ${direction}` : "Sélectionnez une direction"}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher une direction..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>Aucune direction trouvée.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value={selectedLineTermini.start}
                          onSelect={(currentValue) => {
                            setDirection(currentValue)
                            setDirectionOpen(false)
                          }}
                        >
                          Direction {selectedLineTermini.start}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              direction === selectedLineTermini.start ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                        <CommandItem
                          value={selectedLineTermini.end}
                          onSelect={(currentValue) => {
                            setDirection(currentValue)
                            setDirectionOpen(false)
                          }}
                        >
                          Direction {selectedLineTermini.end}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              direction === selectedLineTermini.end ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={!transportMode || !line || !stop || !direction}
          >
            Ajouter l'arrêt favori
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}