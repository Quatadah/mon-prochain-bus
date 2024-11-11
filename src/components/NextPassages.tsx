import { useEffect, useState } from 'react';
import { FavoriteStop } from '../types';
import { getNextPassages } from '../utils/api';

interface Passage {
  destination: string;
  time: string;
}

export function NextPassages({ stop }: { stop: FavoriteStop }) {
  const [passages, setPassages] = useState<Passage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPassages = async () => {
      setLoading(true)
      const nextPassages = await getNextPassages(stop)
      setPassages(nextPassages)
      setLoading(false)
    }

    fetchPassages()
  }, [stop])

  if (loading) {
    return <div>Chargement des prochains passages...</div>
  }

  return (
    <ul className="space-y-2">
      {passages.map((passage, index) => (
        <li key={index}>{passage.destination} - {passage.time}</li>
      ))}
    </ul>
  )
}