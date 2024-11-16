import { FavoriteStop } from "../types";

export function getFavoriteStops(): FavoriteStop[] {
  const stops = localStorage.getItem("favoriteStops");
  return stops ? JSON.parse(stops) : [];
}

export function saveFavoriteStop(stop: FavoriteStop) {
  const stops = getFavoriteStops();
  stops.push(stop);
  localStorage.setItem("favoriteStops", JSON.stringify(stops));
}

export function removeFavoriteStop(stopId: string) {
  const stops = getFavoriteStops();
  const updatedStops = stops.filter((stop) => stop.stop_id !== stopId);
  localStorage.setItem("favoriteStops", JSON.stringify(updatedStops));
}
