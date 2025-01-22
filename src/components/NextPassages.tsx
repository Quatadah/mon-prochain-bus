import { AlertTriangle, Clock, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FavoriteStop } from "../types";
import { getNextPassages } from "../utils/api";
import { getLinePicto } from "../utils/lines";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

interface Passage {
  destinationName: string;
  expectedArrivalTime: string;
  direction: string;
  departureStatus: string;
  vehicleAtStop: boolean;
  lastUpdated: string;
}

function StopComponent({ stop }: { stop: FavoriteStop }) {
  const linePicto = useMemo(() => getLinePicto(stop.id), [stop.id]);

  return (
    <div className="flex items-center justify-center flex-shrink-0">
      {linePicto ? (
        <img src={linePicto} alt={stop.shortname} className="w-6 h-6" />
      ) : (
        <span className="font-bold text-primary-foreground">
          {stop.shortname}
        </span>
      )}
    </div>
  );
}

export function NextPassages({ stop }: { stop: FavoriteStop }) {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    const fetchPassages = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNextPassages(stop.stop_id);
        const parsedPassages = parseApiResponse(data);
        setPassages(parsedPassages);
        setTimeOffset(0);
      } catch (err) {
        setError("Erreur lors de la récupération des prochains passages");
        console.error("Error fetching passages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPassages();
  }, [stop]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOffset(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const parseApiResponse = (data: any): Passage[] => {
    return data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit.map(
      (visit: any) => ({
        destinationName: visit.MonitoredVehicleJourney.DestinationName[0].value,
        expectedArrivalTime:
          visit.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime ||
          visit.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime,
        direction: visit.MonitoredVehicleJourney.DirectionName[0].value,
        departureStatus:
          visit.MonitoredVehicleJourney.MonitoredCall.DepartureStatus,
        vehicleAtStop:
          visit.MonitoredVehicleJourney.MonitoredCall.VehicleAtStop,
        lastUpdated: visit.RecordedAtTime,
      })
    );
  };

  const getMinutesUntilArrival = (expectedTime: string): number => {
    const now = new Date();
    const expected = new Date(expectedTime);
    return Math.max(
      0,
      Math.round((expected.getTime() - now.getTime()) / (1000 * 60)) - timeOffset
    );
  };

  const getArrivalStatus = (minutes: number) => {
    if (minutes <= 6) return "text-red-700 dark:text-red-400";
    if (minutes <= 10) return "text-yellow-700 dark:text-yellow-400";
    return "text-success";
  };

  const displayedPassages = showAll ? passages : passages.slice(0, 4);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-2xl font-bold">
          <div className="flex items-center gap-2">
            <span>Prochains passages</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTimeOffset(0);
                setPassages([]);
                setLoading(true);
                getNextPassages(stop.stop_id)
                  .then(data => {
                    setPassages(parseApiResponse(data));
                  })
                  .catch(err => {
                    setError("Erreur lors de la récupération des prochains passages");
                    console.error("Error fetching passages:", err);
                  })
                  .finally(() => setLoading(false));
              }}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
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
            <ScrollArea className="h-[500px] pr-4">
              <ul className="space-y-4">
                {displayedPassages.length === 0 && (
                  <li className="flex items-center justify-center p-4 rounded-lg bg-muted">
                    <p className="text-center text-muted-foreground">
                      Information non disponible.
                    </p>
                  </li>
                )}
                {displayedPassages.map((passage, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted"
                  >
                    <div className="flex items-center space-x-4">
                      <StopComponent stop={stop} />
                      <div>
                        <p className="font-semibold">
                          {passage.destinationName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Direction: {passage.direction}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`${
                              passage.departureStatus === "onTime"
                                ? "text-success"
                                : "text-warning"
                            }`}
                          >
                            {passage.departureStatus === "onTime"
                              ? "À l'heure"
                              : "Retardé"}
                          </span>
                          {passage.vehicleAtStop && (
                            <span className="text-primary">• En station</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Dernière mise à jour:{" "}
                          {new Date(passage.lastUpdated).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-xs">
                      <div className="relative">
                        <Clock className="w-4 h-4" />
                        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30"></span>
                      </div>
                      <span
                        className={`font-semibold ${getArrivalStatus(
                          getMinutesUntilArrival(passage.expectedArrivalTime)
                        )}`}
                      >
                        {getMinutesUntilArrival(passage.expectedArrivalTime) <=
                        60
                          ? `${getMinutesUntilArrival(
                              passage.expectedArrivalTime
                            )} min`
                          : `${Math.floor(
                              getMinutesUntilArrival(
                                passage.expectedArrivalTime
                              ) / 60
                            )}h ${
                              getMinutesUntilArrival(
                                passage.expectedArrivalTime
                              ) % 60
                            }min`}
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
  );
}
