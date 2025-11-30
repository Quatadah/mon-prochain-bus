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
    <Card className="glass-card border-none shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">Ajouter un favori</CardTitle>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
          Configurez votre nouvel arrêt en sélectionnant les informations ci-dessous.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="transport-mode" className="text-sm font-medium text-foreground/80">
                Mode de transport
              </Label>
              <Popover open={modeOpen} onOpenChange={setModeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="transport-mode"
                    variant="outline"
                    role="combobox"
                    aria-expanded={modeOpen}
                    className="justify-between w-full h-12 rounded-xl bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all shadow-sm"
                  >
                    {transportMode ? (
                      <div className="flex items-center">
                        {modeIcons[transportMode as TransportMode]}
                        {modeMapping[transportMode as TransportMode]}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sélectionnez un mode...</span>
                    )}
                    <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-border/50" align="start">
                  <Command>
                    <CommandInput placeholder="Rechercher un mode..." className="h-11" />
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
                            className="cursor-pointer"
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
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="line" className="text-sm font-medium text-foreground/80">
                  Ligne
                </Label>
                <Popover open={lineOpen} onOpenChange={setLineOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="line"
                      variant="outline"
                      role="combobox"
                      aria-expanded={lineOpen}
                      className="justify-between w-full h-12 rounded-xl bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all shadow-sm"
                    >
                      {line ? (
                        <div className="flex items-center min-w-0">
                          {(() => {
                            const linePicto = getLinePicto(line);
                            return linePicto ? (
                              <img
                                src={linePicto}
                                alt={lines.find(l => l.id === line)?.shortname}
                                className="w-6 h-6 mr-2 object-contain"
                              />
                            ) : (
                              <span className="px-2 py-1 mr-2 rounded bg-primary text-primary-foreground text-xs font-bold">
                                {lines.find(l => l.id === line)?.shortname}
                              </span>
                            );
                          })()}
                          <span className="truncate text-sm">
                            {lines.find(l => l.id === line)?.terminals
                              ? `${lines.find(l => l.id === line)?.terminals?.start} - ${lines.find(l => l.id === line)?.terminals?.end}`
                              : lines.find(l => l.id === line)?.route_long_name}
                          </span>
                        </div>
                      ) : <span className="text-muted-foreground">Sélectionnez une ligne...</span>}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-border/50" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher une ligne..." className="h-11" />
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
                                className="cursor-pointer"
                              >
                                <div className="flex items-center min-w-0">
                                  {l.picto ? (
                                    <img
                                      src={l.picto}
                                      alt={l.shortname}
                                      className="w-6 h-6 mr-2 object-contain flex-shrink-0"
                                    />
                                  ) : (
                                    <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold mr-2 flex-shrink-0">
                                      {l.shortname}
                                    </span>
                                  )}
                                  <span className="truncate text-sm">
                                    {l.terminals ? `${l.terminals.start} - ${l.terminals.end}` : l.route_long_name}
                                  </span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4 flex-shrink-0",
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
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300 delay-75">
                <Label htmlFor="stop" className="text-sm font-medium text-foreground/80">
                  Arrêt
                </Label>
                <Popover open={stopOpen} onOpenChange={setStopOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="stop"
                      variant="outline"
                      role="combobox"
                      aria-expanded={stopOpen}
                      className="justify-between w-full h-12 rounded-xl bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all shadow-sm"
                    >
                      {stop ? (
                        <span className="truncate">{filteredStops.find(s => s.stop_id === stop)?.stop_name}</span>
                      ) : <span className="text-muted-foreground">Sélectionnez un arrêt...</span>}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-border/50" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un arrêt..." className="h-11" />
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
                              className="cursor-pointer"
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
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300 delay-150">
                <Label htmlFor="direction" className="text-sm font-medium text-foreground/80">
                  Direction
                </Label>
                <Popover open={directionOpen} onOpenChange={setDirectionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="direction"
                      variant="outline"
                      role="combobox"
                      aria-expanded={directionOpen}
                      className="justify-between w-full h-12 rounded-xl bg-background/50 border-border/50 hover:bg-background hover:border-primary/50 transition-all shadow-sm"
                    >
                      {direction ? (
                        <span className="truncate">Direction {direction}</span>
                      ) : <span className="text-muted-foreground">Sélectionnez une direction...</span>}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-border/50" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher une direction..." className="h-11" />
                      <CommandList>
                        <CommandEmpty>Aucune direction trouvée.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value={selectedLineTermini.start}
                            onSelect={(currentValue) => {
                              setDirection(currentValue)
                              setDirectionOpen(false)
                            }}
                            className="cursor-pointer"
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
                            className="cursor-pointer"
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
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!transportMode || !line || !stop || !direction}
          >
            Ajouter aux favoris
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}