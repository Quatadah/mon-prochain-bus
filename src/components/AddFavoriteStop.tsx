'use client'

import { Bus, Check, ChevronsUpDown, Train, TramFront } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
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
const typedArretsLignes = arretsLignes as Stop[]

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

  const selectedLineTermini = useMemo(() => {
    if (!line) return null;
    return typedTerminus[line] || null;
  }, [line]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const selectedStop = filteredStops.find((s: Stop) => s.stop_id === stop);
    if (selectedStop && direction) {
      onAdd({ ...selectedStop, direction } as FavoriteStop)
      setTransportMode('')
      setLine('')
      setStop('')
      setDirection('')
    }
  }, [filteredStops, stop, direction, onAdd])

  const renderPopover = useCallback((
    id: string,
    label: string,
    value: string,
    options: any[],
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    setValue: (value: any) => void,
    renderOption: (option: any) => React.ReactNode
  ) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Label htmlFor={id} className="sm:min-w-32">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="justify-between w-full"
          >
            {value ? renderOption(options.find(o => o.id === value || o === value)) : `Sélectionnez ${label.toLowerCase()}`}
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Rechercher ${label.toLowerCase()}...`} className="h-9" />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id || option}
                    value={option.id || option}
                    onSelect={(currentValue) => {
                      setValue(currentValue)
                      setIsOpen(false)
                    }}
                  >
                    {renderOption(option)}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === (option.id || option) ? "opacity-100" : "opacity-0"
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
  ), [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un arrêt favori</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2">
          {renderPopover(
            "transport-mode",
            "Mode de transport",
            transportMode,
            transportModes,
            modeOpen,
            setModeOpen,
            setTransportMode,
            (mode) => (
              <>
                {modeIcons[mode as TransportMode]}
                {modeMapping[mode as TransportMode]}
              </>
            )
          )}

          {transportMode && renderPopover(
            "line",
            "Ligne",
            line,
            lines,
            lineOpen,
            setLineOpen,
            setLine,
            (l) => (
              <div className="flex items-center">
                {getLinePicto(l.id) ? (
                  <img
                    src={getLinePicto(l.id)}
                    alt={l.shortname}
                    className="w-6 h-6 mr-2"
                  />
                ) : (
                  <span className="px-2 py-1 mr-2 rounded bg-primary text-primary-foreground">
                    {l.shortname}
                  </span>
                )}
                {selectedLineTermini && (
                  <span className="ml-2 text-sm hover:text-primary-foreground">
                    {selectedLineTermini.start} - {selectedLineTermini.end}
                  </span>
                )}
              </div>
            )
          )}

          {transportMode && line && renderPopover(
            "stop",
            "Arrêt",
            stop,
            filteredStops,
            stopOpen,
            setStopOpen,
            setStop,
            (s) => s.stop_name
          )}

          {selectedLineTermini && renderPopover(
            "direction",
            "Direction",
            direction,
            [selectedLineTermini.start, selectedLineTermini.end],
            directionOpen,
            setDirectionOpen,
            setDirection,
            (d) => `Direction ${d}`
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