import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
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
    <div className={`flex items-center justify-center flex-shrink-0 w-8 h-8 ${stop.mode === 'Tramway' ? 'bg-white rounded-lg p-0.5' : ''}`}>
      {linePicto ? (
        <img src={linePicto} alt={stop.shortname} className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full rounded-lg bg-white shadow-sm border border-border/50 flex items-center justify-center">
          <span className="font-bold text-primary text-sm">
            {stop.shortname}
          </span>
        </div>
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addToast } = useToast();

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

  const fetchPassages = useCallback(async (showToast = false) => {
    setLoading(true);
    setError(null);
    setIsRefreshing(true);
    try {
      const data = await getNextPassages(stop.stop_id);
      const parsedPassages = parseApiResponse(data);
      setPassages(parsedPassages);
      setTimeOffset(0);
      setLastUpdate(new Date());
      if (showToast) {
        addToast({
          title: "Données mises à jour",
          description: "Les horaires ont été actualisés",
          variant: "success"
        });
      }
    } catch (err) {
      setError("Erreur lors de la récupération des prochains passages");
      console.error("Error fetching passages:", err);
      if (showToast) {
        addToast({
          title: "Erreur",
          description: "Impossible de récupérer les horaires",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [stop.stop_id, addToast]);

  useEffect(() => {
    fetchPassages();
  }, [fetchPassages]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPassages();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchPassages]);

  // Update time offset every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOffset(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getMinutesUntilArrival = (expectedTime: string): number => {
    const now = new Date();
    const expected = new Date(expectedTime);
    return Math.max(
      0,
      Math.round((expected.getTime() - now.getTime()) / (1000 * 60)) - timeOffset
    );
  };

  const getArrivalStatus = (minutes: number) => {
    if (minutes <= 6) return "text-red-600 dark:text-red-400";
    if (minutes <= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const displayedPassages = showAll ? passages : passages.slice(0, 4);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="glass-card border-none shadow-xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/30">
        <CardTitle className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Prochains passages</h2>
                {isRefreshing && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchPassages(true)}
              disabled={isRefreshing}
              className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
              aria-label="Rafraîchir les horaires"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <StopComponent stop={stop} />
              {stop.stop_name}
            </span>
            {lastUpdate && (
              <span className="text-[10px] font-medium text-muted-foreground/80 flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {formatLastUpdate(lastUpdate)}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading && !passages.length ? (
          <div className="space-y-3 p-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-full h-20 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center" role="alert">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
            </div>
            <p className="text-destructive font-semibold mb-2">{error}</p>
            <Button
              onClick={() => fetchPassages(true)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] sm:h-[500px] md:h-[600px]">
              <ul className="divide-y divide-border/50" role="list">
                <AnimatePresence mode="popLayout">
                  {displayedPassages.length === 0 && (
                    <motion.li
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center p-12 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        Aucun passage disponible
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                        Les horaires ne sont pas disponibles pour le moment.
                      </p>
                    </motion.li>
                  )}
                  {displayedPassages.map((passage, index) => {
                    const minutes = getMinutesUntilArrival(passage.expectedArrivalTime);
                    return (
                      <motion.li
                        key={`${passage.destinationName}-${passage.expectedArrivalTime}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        role="listitem"
                        className="group relative p-4 hover:bg-muted/30 transition-colors"
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-base truncate text-foreground">
                                {passage.destinationName}
                              </p>
                              {passage.vehicleAtStop && (
                                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                  À quai
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="truncate">Dir. {passage.direction}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span
                                className={`text-xs font-medium ${passage.departureStatus === "onTime"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400"
                                  }`}
                              >
                                {passage.departureStatus === "onTime" ? "À l'heure" : "Retardé"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end flex-shrink-0">
                            <div className={`flex items-baseline gap-1 ${getArrivalStatus(minutes)}`}>
                              <span className="text-2xl font-bold tabular-nums tracking-tight">
                                {minutes <= 60 ? minutes : Math.floor(minutes / 60)}
                              </span>
                              <span className="text-xs font-medium uppercase">
                                {minutes <= 60 ? 'min' : 'h'}
                              </span>
                              {minutes > 60 && (
                                <>
                                  <span className="text-2xl font-bold tabular-nums tracking-tight ml-1">
                                    {minutes % 60}
                                  </span>
                                  <span className="text-xs font-medium uppercase">min</span>
                                </>
                              )}
                            </div>
                            {minutes <= 6 && (
                              <span className="text-[10px] font-medium text-red-500 animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Départ imminent
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Progress bar for time */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${minutes <= 6 ? 'bg-red-500' : minutes <= 10 ? 'bg-yellow-500' : 'bg-emerald-500'
                              }`}
                            style={{ width: `${Math.max(0, 100 - (minutes * 2))}%` }}
                          />
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </ScrollArea>
            {passages.length > 4 && (
              <div className="p-4 border-t border-border/50 bg-muted/10">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  {showAll ? "Voir moins" : `Voir ${passages.length - 4} autres passages`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
