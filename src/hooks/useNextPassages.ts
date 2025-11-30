import useSWR from 'swr';
import { getNextPassages } from '../utils/api';

const fetcher = (stopId: string) => getNextPassages(stopId);

export function useNextPassages(stopId: string) {
    const { data, error, isLoading, mutate } = useSWR(
        stopId ? `passages-${stopId}` : null,
        () => fetcher(stopId),
        {
            refreshInterval: 120000, // 2 minutes
            revalidateOnFocus: true,
            shouldRetryOnError: true,
        }
    );

    const parseApiResponse = (data: any) => {
        if (!data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit) {
            return [];
        }
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

    return {
        passages: data ? parseApiResponse(data) : [],
        isLoading,
        error,
        mutate,
        lastUpdated: data?.Siri?.ServiceDelivery?.ResponseTimestamp ? new Date(data.Siri.ServiceDelivery.ResponseTimestamp) : null
    };
}
