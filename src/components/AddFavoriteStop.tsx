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
import terminus from '../data/terminus.json'
import { cn } from "../lib/utils"
import { FavoriteStop, Line, Stop, TransportMode } from '../types'
import { getLinePicto } from '../utils/lines'

type TerminusType = {
  [key: string]: { start: string; end: string; }
};

const typedTerminus = terminus as TerminusType;

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
          operatorname: stop.operatorname,
          terminals: typedTerminus[stop.id] || null,
          picto: getLinePicto(stop.id) || null
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

  const selectedLineTermini = useMemo(() => {
    if (!line) return null;
    return typedTerminus[line];
  }, [line]);

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Label htmlFor="transport-mode" className="sm:min-w-32">Mode de transport</Label>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <Label htmlFor="line" className="sm:min-w-32">Ligne</Label>
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
                        {(() => {
                          const linePicto = getLinePicto(line);
                          return linePicto ? (
                            <img
                              src={linePicto}
                              alt={lines.find(l => l.id === line)?.shortname}
                              className="w-6 h-6 mr-2"
                            />
                          ) : (
                            <span className="px-2 py-1 mr-2 rounded bg-primary text-primary-foreground">
                              {lines.find(l => l.id === line)?.shortname}
                            </span>
                          );
                        })()}
                        {lines.find(l => l.id === line)?.terminals && (
                          <span className="text-sm">
                            {lines.find(l => l.id === line)?.terminals?.start} - {lines.find(l => l.id === line)?.terminals?.end}
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
                          return (
                            <CommandItem
                              key={l.id}
                              value={`${l.shortname} ${l.route_long_name} ${l.operatorname} ${l.terminals?.start} - ${l.terminals?.end}`}
                              onSelect={() => {
                                setLine(l.id)
                                setLineOpen(false)
                              }}
                            > 
                              <div className="flex items-center">
                                {l.picto ? (
                                  <img
                                    src={l.picto}
                                    alt={l.shortname}
                                    className="w-6 h-6 mr-2"
                                  />
                                ) : (
                                  <span className="px-2 py-1 rounded bg-primary text-primary-foreground">
                                    {l.shortname}
                                  </span>
                                )}
                                {l.terminals && (
                                  <span className="ml-2 text-sm hover:text-primary-foreground">
                                    {l.terminals.start} - {l.terminals.end}
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <Label htmlFor="stop" className="sm:min-w-32">Arrêt</Label>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <Label htmlFor="direction" className="sm:min-w-32">Direction</Label>
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