import { Button } from "../components/ui/button"
import referentielDesLignes from '../data/referentiel-des-lignes.json'
import { FavoriteStop, Line } from '../types'

export function FavoriteStopsList({ stops, onSelectStop }: { stops: FavoriteStop[], onSelectStop: (stop: FavoriteStop) => void }) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Mes arrêts favoris</h2>
      <ul className="space-y-2">
        {stops.map((stop, index) => {
          const lineInfo = referentielDesLignes.find(l => l.shortname_line === stop.shortname) as Line | undefined
          return (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                {lineInfo?.picto && (
                  <img src={lineInfo.picto.url} alt={lineInfo.name_line} className="w-6 h-6 mr-2" />
                )}
                <span style={{color: `#${lineInfo?.textcolourweb_hexa}`, backgroundColor: `#${lineInfo?.colourweb_hexa}`}} className="px-2 py-1 rounded mr-2">
                  {stop.shortname}
                </span>
                <span>{stop.stop_name} ({stop.direction})</span>
              </div>
              <Button onClick={() => onSelectStop(stop)}>Voir les passages</Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}