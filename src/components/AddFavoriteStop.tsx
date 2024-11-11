import React, { useMemo, useState } from 'react'
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import arretsLignes from '../data/arrets-lignes.json'
import referentielDesLignes from '../data/referentiel-des-lignes.json'
import { FavoriteStop, Line, Stop, TransportMode } from '../types'

const transportModes: TransportMode[] = ['Metro', 'RER', 'Bus', 'Tram'];

export function AddFavoriteStop({ onAdd }: { onAdd: (stop: FavoriteStop) => void }) {
  const [transportMode, setTransportMode] = useState<TransportMode | ''>('')
  const [line, setLine] = useState('')
  const [stop, setStop] = useState('')
  const [direction, setDirection] = useState<'aller' | 'retour' | ''>('')

  const filteredStops = useMemo(() => {
    return arretsLignes.filter(
      (s: Stop) => s.mode === transportMode && s.shortname === line
    );
  }, [transportMode, line]);

  const lines = useMemo(() => {
    return referentielDesLignes.filter(
      (l: Line) => l.transportmode.toLowerCase() === transportMode.toLowerCase()
    );
  }, [transportMode]);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select onValueChange={(value) => setTransportMode(value as TransportMode)} value={transportMode}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez un mode de transport" />
        </SelectTrigger>
        <SelectContent>
          {transportModes.map(mode => (
            <SelectItem key={mode} value={mode}>
              {mode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setLine} value={line}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une ligne" />
        </SelectTrigger>
        <SelectContent>
          {lines.map((l: Line) => (
            <SelectItem key={l.id_line} value={l.shortname_line}>
              <div className="flex items-center">
                {l.picto && (
                  <img src={l.picto.url} alt={l.name_line} className="w-6 h-6 mr-2" />
                )}
                <span style={{color: `#${l.textcolourweb_hexa}`, backgroundColor: `#${l.colourweb_hexa}`}} className="px-2 py-1 rounded">
                  {l.name_line}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setStop} value={stop}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez un arrêt" />
        </SelectTrigger>
        <SelectContent>
          {filteredStops.map((s: Stop) => (
            <SelectItem key={s.stop_id} value={s.stop_id}>
              {s.stop_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => setDirection(value as 'aller' | 'retour')} value={direction}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez un sens" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="aller">Aller</SelectItem>
          <SelectItem value="retour">Retour</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit">Ajouter l'arrêt favori</Button>
    </form>
  )
}