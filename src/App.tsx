import { useEffect, useState } from 'react';
import { AddFavoriteStop } from './components/AddFavoriteStop';
import { FavoriteStopsList } from './components/FavoriteStopsList';
import { NextPassages } from './components/NextPassages';
import { getFavoriteStops, saveFavoriteStop } from './utils/storage';

export default function App() {
  const [favoriteStops, setFavoriteStops] = useState([])
  const [selectedStop, setSelectedStop] = useState(null)

  useEffect(() => {
    setFavoriteStops(getFavoriteStops())
  }, [])

  const handleAddFavoriteStop = (stop: any) => {
    saveFavoriteStop(stop)
    setFavoriteStops(getFavoriteStops())
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mes arrêts favoris</h1>
      <AddFavoriteStop onAdd={handleAddFavoriteStop} />
      <FavoriteStopsList 
        stops={favoriteStops} 
        onSelectStop={setSelectedStop} 
      />
      {selectedStop && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Prochains passages</h2>
          <NextPassages stop={selectedStop} />
        </div>
      )}
    </div>
  )
}