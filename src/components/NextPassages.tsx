import { AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FavoriteStop } from '../types';
import { getNextPassages } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

interface Passage {
  destinationName: string;
  expectedArrivalTime: string;
}

export function NextPassages({ stop }: { stop: FavoriteStop }) {
  const [passages, setPassages] = useState<Passage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [, setUpdateTrigger] = useState(0)

  useEffect(() => {
    const fetchPassages = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getNextPassages(stop.stop_id)
        const parsedPassages = parseApiResponse(data)
        setPassages(parsedPassages)
      } catch (err) {
        setError('Erreur lors de la récupération des prochains passages')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPassages()
  }, [stop])

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const parseApiResponse = (data: any): Passage[] => {
    return data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit.map((visit: any) => ({
      destinationName: visit.MonitoredVehicleJourney.DestinationName[0].value,
      expectedArrivalTime: visit.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime
    }))
  }

  const getMinutesUntilArrival = (expectedTime: string): number => {
    const now = new Date();
    const expected = new Date(expectedTime);
    return Math.max(0, Math.round((expected.getTime() - now.getTime()) / (1000 * 60)));
  };

  const getArrivalStatus = (minutes: number) => {
    if (minutes <= 5) return "text-destructive";
    if (minutes <= 10) return "text-warning";
    return "text-success";
  };

  const displayedPassages = showAll ? passages : passages.slice(0, 4)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl font-bold">
          <span>Prochains passages</span>
          <span className="text-sm font-normal text-muted-foreground">
            {stop.stop_name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4 text-destructive">
            <AlertTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[300px] pr-4">
              <ul className="space-y-4">
                {displayedPassages.length === 0 && (
                  <li className="flex items-center justify-center p-4 rounded-lg bg-muted">
                    <p className="text-center text-muted-foreground">Information non disponible.</p>
                  </li>
                )}
                {displayedPassages.map((passage, index) => (
                  <li key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary">
                        <span className="font-bold text-primary-foreground">{stop.shortname}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{passage.destinationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(passage.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="relative">
                        <Clock className="w-4 h-4" />
                        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30"></span>
                      </div>
                      <span className={`font-semibold ${getArrivalStatus(getMinutesUntilArrival(passage.expectedArrivalTime))}`}>
                        {getMinutesUntilArrival(passage.expectedArrivalTime) <= 60 ? `${getMinutesUntilArrival(passage.expectedArrivalTime)} min` : `${Math.floor(getMinutesUntilArrival(passage.expectedArrivalTime) / 60)}h ${getMinutesUntilArrival(passage.expectedArrivalTime) % 60}min`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            {passages.length > 4 && (
              <Button 
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                className="w-full mt-4"
              >
                {showAll ? "Voir moins" : "Voir plus"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}